"use client";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { PRACTICES, type Practice } from "@/lib/practices";
import { sitStreak } from "@/lib/journal";
import type { Experiment, GuideTurn, Journal, Message, NarrativeStatus } from "@/lib/types";

type Tab = "talk" | "stories" | "stillness";

async function api<T>(path: string, body?: unknown): Promise<T> {
  if (typeof navigator !== "undefined" && !navigator.onLine) throw new Error("You're offline. Reconnect to talk with Koan.");
  const r = await fetch(path, body === undefined ? { cache: "no-store" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const data = (await r.json().catch(() => ({}))) as T & { error?: string };
  if (r.status === 401) { window.location.href = "/login"; throw new Error("Please sign in again."); }
  if (!r.ok) throw new Error(data.error || `Request failed (${r.status}).`);
  return data;
}

export default function KoanApp({ user }: { user: string }) {
  const [tab, setTab] = useState<Tab>("talk");
  const [journal, setJournal] = useState<Journal | null>(null);
  const [error, setError] = useState("");
  const [practice, setPractice] = useState<Practice | Experiment | null>(null);

  useEffect(() => {
    api<{ journal: Journal }>("/api/journal").then((d) => setJournal(d.journal)).catch((e) => setError((e as Error).message));
    if ("serviceWorker" in navigator && window.isSecureContext && process.env.NODE_ENV === "production") navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);

  const act = async (body: unknown) => {
    try { setJournal((await api<{ journal: Journal }>("/api/journal", body)).journal); } catch (e) { setError((e as Error).message); }
  };

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/";
  }

  const open = journal?.narratives.filter((n) => n.status !== "seen-through").length ?? 0;
  return (
    <div className="app">
      <header className="app-head">
        <Logo />
        <span className="muted small">{user}</span>
        <button className="btn-ghost small" onClick={signOut}>Sign out</button>
      </header>

      <nav className="tabs" aria-label="Sections">
        {([["talk", "Talk"], ["stories", `Stories${open ? ` · ${open}` : ""}`], ["stillness", "Stillness"]] as [Tab, string][]).map(([t, label]) => (
          <button key={t} className={tab === t ? "active" : ""} aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)}>{label}</button>
        ))}
      </nav>

      {error && <p className="error banner" role="alert" onClick={() => setError("")}>{error}</p>}

      <main className="app-main">
        {!journal ? <p className="muted center">Settling in…</p>
          : tab === "talk" ? <Talk journal={journal} setJournal={setJournal} onError={setError} onTry={(x) => { setPractice(x); setTab("stillness"); }} act={act} />
          : tab === "stories" ? <Stories journal={journal} act={act} />
          : <Stillness journal={journal} act={act} chosen={practice} choose={setPractice} />}
      </main>
    </div>
  );
}

function Talk({ journal, setJournal, onError, onTry, act }: { journal: Journal; setJournal: (j: Journal) => void; onError: (s: string) => void; onTry: (x: Experiment) => void; act: (b: unknown) => Promise<void> }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [journal.messages.length, pending]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true); setPending(t); setText("");
    try {
      const d = await api<{ turn: GuideTurn; live: boolean; journal: Journal }>("/api/guide", { text: t });
      setJournal(d.journal);
      setDemo(!d.live && !d.turn.care);
    } catch (err) {
      setText(t);
      onError((err as Error).message);
    } finally { setBusy(false); setPending(null); }
  }

  return (
    <section className="talk">
      {journal.messages.length === 0 && !pending && (
        <div className="welcome card">
          <h2>What&apos;s here right now?</h2>
          <p className="muted">A worry, a win, a thought that keeps looping, or nothing at all. Start anywhere. Koan won&apos;t tell you who you are; it&apos;ll help you look.</p>
          <div className="starters">
            {["I can't stop overthinking tonight.", "I feel stuck and don't know why.", "Something good happened and I don't trust it.", "I want to try meditating but I'm restless."].map((s) => (
              <button key={s} className="chip-btn" onClick={() => setText(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}
      <ol className="thread">
        {journal.messages.map((m, i) => <Bubble key={`${m.at}-${i}`} m={m} onTry={onTry} />)}
        {pending && <li className="bubble me">{pending}</li>}
        {pending && <li className="bubble guide typing" aria-label="Koan is reflecting"><span /><span /><span /></li>}
      </ol>
      <div ref={end} />
      {demo && <p className="fine center">Demo mode: Koan is using scripted questions until the AI key is set.</p>}
      <form className="composer" onSubmit={send}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Say what's on your mind…" rows={2} maxLength={2000}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} aria-label="Your message" />
        <button className="btn-primary" disabled={busy || !text.trim()}>Send</button>
      </form>
      {journal.messages.length > 0 && <button className="btn-ghost small center-block" onClick={() => { if (confirm("Clear this conversation? Your stories and sits are kept.")) void act({ action: "clear-conversation" }); }}>Start fresh</button>}
    </section>
  );
}

function Bubble({ m, onTry }: { m: Message; onTry: (x: Experiment) => void }) {
  if (m.role === "user") return <li className="bubble me">{m.text}</li>;
  return (
    <li className={`bubble guide${m.care ? " care" : ""}`}>
      <p>{m.text}</p>
      {m.question && <p className="question">{m.question}</p>}
      {m.experiment && (
        <div className="experiment">
          <strong>Try: {m.experiment.title}</strong>
          <p>{m.experiment.invitation}</p>
          <button className="btn-ghost small" onClick={() => onTry(m.experiment!)}>Do it now</button>
        </div>
      )}
    </li>
  );
}

const STATUS_LABEL: Record<NarrativeStatus, string> = { noticed: "Noticed", questioned: "Questioned", "seen-through": "Seen through" };

function Stories({ journal, act }: { journal: Journal; act: (b: unknown) => Promise<void> }) {
  const [story, setStory] = useState("");
  const list = [...journal.narratives].sort((a, b) => (a.status === "seen-through" ? 1 : 0) - (b.status === "seen-through" ? 1 : 0) || b.lastSeen - a.lastSeen);
  return (
    <section className="stories">
      <div className="card intro">
        <h2>The stories you tell</h2>
        <p className="muted">Narratives Koan has noticed in your words, or that you&apos;ve added. You don&apos;t have to fight them. Seeing a story as a story is most of the work.</p>
        <form className="add" onSubmit={(e) => { e.preventDefault(); if (story.trim()) { void act({ action: "notice", story, where: "added by you" }); setStory(""); } }}>
          <input value={story} onChange={(e) => setStory(e.target.value)} placeholder="e.g. I have to earn rest" maxLength={140} aria-label="A story you notice" />
          <button className="btn-primary" disabled={!story.trim()}>Add</button>
        </form>
      </div>
      {list.length === 0 && <p className="muted center">No stories yet. They tend to show up on their own once you start talking.</p>}
      <ul className="narratives">
        {list.map((n) => (
          <li key={n.id} className={`card narrative ${n.status}`}>
            <p className="story">&ldquo;{n.story}&rdquo;</p>
            <p className="meta">Seen {n.count}× · last {new Date(n.lastSeen).toLocaleDateString()}</p>
            {n.notes.length > 0 && <ul className="notes">{n.notes.slice(-3).map((x, i) => <li key={i}>{x}</li>)}</ul>}
            <div className="seg small" role="group" aria-label="Where you are with this story">
              {(Object.keys(STATUS_LABEL) as NarrativeStatus[]).map((s) => (
                <button key={s} className={n.status === s ? "active" : ""} aria-pressed={n.status === s} onClick={() => void act({ action: "status", id: n.id, status: s })}>{STATUS_LABEL[s]}</button>
              ))}
            </div>
            <button className="link small" onClick={() => void act({ action: "remove", id: n.id })}>Remove</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function chime() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 528; o.type = "sine";
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 4);
  } catch { /* no audio */ }
}

function Stillness({ journal, act, chosen, choose }: { journal: Journal; act: (b: unknown) => Promise<void>; chosen: Practice | Experiment | null; choose: (p: Practice | Experiment | null) => void }) {
  const [minutes, setMinutes] = useState(5);
  const [left, setLeft] = useState<number | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const started = useRef(0);

  useEffect(() => { if (chosen && "minutes" in chosen) setMinutes(chosen.minutes); }, [chosen]);
  useEffect(() => {
    if (left === null) return;
    if (left <= 0) { chime(); setDone(minutes); setLeft(null); return; }
    const t = setTimeout(() => setLeft(Math.max(0, minutes * 60 - Math.round((Date.now() - started.current) / 1000))), 500);
    return () => clearTimeout(t);
  }, [left, minutes]);

  const start = () => { chime(); started.current = Date.now(); setDone(null); setLeft(minutes * 60); };
  const stop = () => { const m = Math.round((Date.now() - started.current) / 6000) / 10; setLeft(null); setDone(m); };
  const total = journal.sits.reduce((s, x) => s + x.minutes, 0);
  const streak = sitStreak(journal.sits);

  return (
    <section className="stillness">
      <div className="card timer">
        {chosen ? <><p className="kicker">{"lens" in chosen ? chosen.lens : "From your conversation"}</p><h2>{chosen.title}</h2><p>{chosen.invitation}</p></> : <><h2>Sit for a while</h2><p className="muted">Pick an experiment below, or just sit. Nothing to achieve.</p></>}
        {left !== null ? (
          <>
            <p className="clock" aria-live="off">{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</p>
            <button className="btn-ghost" onClick={stop}>End early</button>
          </>
        ) : done !== null ? (
          <form className="after" onSubmit={(e) => { e.preventDefault(); void act({ action: "sit", minutes: done, note: [chosen?.title, note].filter(Boolean).join(": ") }); setDone(null); setNote(""); }}>
            <label htmlFor="sit-note">What did you notice? (optional)</label>
            <textarea id="sit-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={180} placeholder="Restless at first, then the birds got very loud…" />
            <div className="row"><button className="btn-primary">Save sit</button><button type="button" className="btn-ghost" onClick={() => setDone(null)}>Don&apos;t save</button></div>
          </form>
        ) : (
          <div className="row">
            <label className="mins">Minutes <input type="number" min={1} max={120} value={minutes} onChange={(e) => setMinutes(Math.min(120, Math.max(1, Number(e.target.value) || 1)))} /></label>
            <button className="btn-primary btn-lg" onClick={start}>Begin</button>
            {chosen && <button className="btn-ghost" onClick={() => choose(null)}>Clear</button>}
          </div>
        )}
        <p className="fine">{journal.sits.length} sits · {Math.round(total)} minutes{streak ? ` · ${streak}-day streak` : ""}</p>
      </div>

      <h3>Experiments</h3>
      <ul className="practices">
        {PRACTICES.map((p) => (
          <li key={p.id}>
            <button className={`card practice ${p.kind}`} onClick={() => { choose(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <span className="kicker">{p.kind} · {p.minutes} min · {p.lens}</span>
              <strong>{p.title}</strong>
            </button>
          </li>
        ))}
      </ul>

      {journal.sits.length > 0 && (
        <>
          <h3>Recent sits</h3>
          <ul className="sits">{journal.sits.slice(-5).reverse().map((s) => <li key={s.at}><span>{new Date(s.at).toLocaleDateString()} · {s.minutes} min</span>{s.note && <em>{s.note}</em>}</li>)}</ul>
        </>
      )}
    </section>
  );
}
