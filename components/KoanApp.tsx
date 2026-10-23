"use client";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { PRACTICES, type Practice } from "@/lib/practices";
import { sitStreak } from "@/lib/journal";
import type { Experiment, GuideTurn, Journal, Message, NarrativeStatus } from "@/lib/types";
import { QUESTS, WISDOM, wisdomOfDay, type Quest } from "@/lib/wisdom";
import { WisdomCard } from "./WisdomCard";
import { CIRCLES, teacherInfo, type Circle } from "@/lib/teachers";
import { Enso, Frog, Icon, type IconName } from "./Ink";
import { BELLS, bellLength, newAudio, preview, saveBell, savedBell, strike, type BellId } from "@/lib/bells";

type Tab = "talk" | "path" | "stories" | "stillness";

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
        <details className="me-menu">
          <summary>{user}</summary>
          <div className="menu">
            <a className="link" href="/api/account/export" download>Download my journal</a>
            <button className="link" onClick={signOut}>Sign out</button>
            <button className="link danger" onClick={() => (document.getElementById("delete-dialog") as HTMLDialogElement | null)?.showModal()}>Delete my account</button>
          </div>
        </details>
        <DeleteDialog />
      </header>

      <nav className="dock" aria-label="Sections">
        {([["talk", "Talk", "talk"], ["path", "Path", "path"], ["stories", "Stories", "stories"], ["stillness", "Sit", "sit"]] as [Tab, string, IconName][]).map(([t, label, icon]) => (
          <button key={t} className={tab === t ? "active" : ""} aria-current={tab === t ? "page" : undefined} onClick={() => { setTab(t); window.scrollTo({ top: 0 }); }}>
            <Icon name={icon} />
            <span>{label}</span>
            {t === "stories" && open > 0 && <span className="badge" aria-label={`${open} open`}>{open}</span>}
          </button>
        ))}
      </nav>

      {error && <p className="error banner" role="alert" onClick={() => setError("")}>{error}</p>}

      <main className="app-main">
        {!journal ? <div className="settling"><Frog size={96} /><p className="muted">Settling in… no rush.</p></div>
          : tab === "talk" ? <Talk journal={journal} setJournal={setJournal} onError={setError} onTry={(x) => { setPractice(x); setTab("stillness"); }} act={act} />
          : tab === "path" ? <Path journal={journal} act={act} />
          : tab === "stories" ? <Stories journal={journal} act={act} />
          : <Stillness journal={journal} act={act} chosen={practice} choose={setPractice} />}
      </main>
    </div>
  );
}

function DeleteDialog() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function confirmDelete(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await api("/api/account/delete", { password });
      window.location.href = "/";
    } catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <dialog id="delete-dialog" className="dialog" onClose={() => { setPassword(""); setError(""); }}>
      <form onSubmit={confirmDelete}>
        <h2>Delete your account?</h2>
        <p className="muted">This erases your account, conversations, stories, sits and discoveries for good. There&apos;s no undo. You might want to download your journal first.</p>
        <label htmlFor="delete-pass">Type your password to confirm</label>
        <input id="delete-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error" role="alert">{error}</p>}
        <div className="row">
          <button type="button" className="btn-ghost" onClick={(e) => (e.currentTarget.closest("dialog") as HTMLDialogElement).close()}>Keep it</button>
          <button className="btn-ink danger" disabled={busy || password.length < 8}>{busy ? "Deleting…" : "Delete forever"}</button>
        </div>
      </form>
    </dialog>
  );
}

function Talk({ journal, setJournal, onError, onTry, act }: { journal: Journal; setJournal: (j: Journal) => void; onError: (s: string) => void; onTry: (x: Experiment) => void; act: (b: unknown) => Promise<void> }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [fresh, setFresh] = useState<number | null>(null);
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
      setFresh(d.journal.messages.at(-1)?.at ?? null);
      setDemo(!d.live && !d.turn.care);
    } catch (err) {
      setText(t);
      onError((err as Error).message);
    } finally { setBusy(false); setPending(null); }
  }

  return (
    <section className="talk">
      {journal.messages.length === 0 && !pending && (
        <div className="welcome">
          <Frog size={88} className="welcome-frog" />
          <h1>What&apos;s here right now?</h1>
          <p className="muted">A worry, a win, a thought that keeps looping, or nothing at all. Start anywhere. Koan won&apos;t tell you who you are; it&apos;ll help you look.</p>
          <div className="starters">
            {["I can't stop overthinking tonight.", "I feel stuck and don't know why.", "Something good happened and I don't trust it.", "I want to try meditating but I'm restless."].map((s) => (
              <button key={s} className="chip-btn" onClick={() => setText(s)}>{s}</button>
            ))}
          </div>
          <p className="kicker">Today&apos;s pebble of wisdom</p>
          <WisdomCard card={wisdomOfDay()} />
        </div>
      )}
      <ol className="thread">
        {journal.messages.map((m, i) => <Bubble key={`${m.at}-${i}`} m={m} onTry={onTry} reveal={m.role === "guide" && m.at === fresh} />)}
        {pending && <li className="me-line">{pending}</li>}
        {pending && <li className="guide-line typing" aria-label="Koan is pondering"><Enso size={22} stroke={12} className="pondering" /><span className="muted">pondering…</span></li>}
      </ol>
      <div ref={end} />
      {demo && <p className="fine center">Demo mode: Koan is using scripted questions until the AI key is set.</p>}
      <form className="composer" onSubmit={send}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Say what's on your mind…" rows={2} maxLength={2000}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} aria-label="Your message" />
        <button className="btn-ink" disabled={busy || !text.trim()}>Send</button>
      </form>
      {journal.messages.length > 0 && <button className="btn-ghost small center-block" onClick={() => { if (confirm("Clear this conversation? Your stories and sits are kept.")) void act({ action: "clear-conversation" }); }}>Start fresh</button>}
    </section>
  );
}

// A new reply is inked in word by word, top to bottom; replies already on the page just sit there.
function Bubble({ m, onTry, reveal }: { m: Message; onTry: (x: Experiment) => void; reveal?: boolean }) {
  if (m.role === "user") return <li className="me-line">{m.text}</li>;
  const words = m.text.split(/(\s+)/);
  const step = Math.min(45, 2200 / Math.max(1, words.length / 2));
  let t = 0;
  const after = () => ({ style: { animationDelay: `${(t += 260)}ms` } as React.CSSProperties, className: "rise" });
  const text = reveal ? words.map((w, i) => (/^\s+$/.test(w) ? w : <span key={i} className="ink-in" style={{ animationDelay: `${(t = (i / 2) * step)}ms` }}>{w}</span>)) : m.text;
  const q = reveal && m.question ? after() : null;
  const card = reveal && m.wisdom ? after() : null;
  const exp = reveal && m.experiment ? after() : null;
  return (
    <li className={`guide-line${m.care ? " care" : ""}${reveal ? " revealing" : ""}`}>
      <Enso size={22} stroke={12} className="avatar" />
      <div className="guide-body">
      <p aria-label={reveal ? m.text : undefined}>{text}</p>
      {m.question && <p className={`question ${q?.className ?? ""}`} style={q?.style}>{m.question}</p>}
      {m.wisdom && <div className={card?.className} style={card?.style}><WisdomCard id={m.wisdom} compact /></div>}
      {m.experiment && (
        <div className={`experiment ${exp?.className ?? ""}`} style={exp?.style}>
          <strong>Try: {m.experiment.title}</strong>
          <p>{m.experiment.invitation}</p>
          <button className="btn-ghost small" onClick={() => onTry(m.experiment!)}>Do it now</button>
        </div>
      )}
      </div>
    </li>
  );
}

function Path({ journal, act }: { journal: Journal; act: (b: unknown) => Promise<void> }) {
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [circle, setCircle] = useState<Circle | "All">("All");
  const inCircle = (c: Circle | "All") => (c === "All" ? WISDOM : WISDOM.filter((w) => teacherInfo(w.teacher).circle === c));
  const cards = inCircle(circle);
  const [deck, setDeck] = useState(() => WISDOM[Math.floor(Math.random() * WISDOM.length)].id);
  const at = Math.max(0, cards.findIndex((w) => w.id === deck));
  const draw = () => setDeck(cards[(at + 1 + Math.floor(Math.random() * Math.max(1, cards.length - 1))) % cards.length].id);
  const pickCircle = (c: Circle | "All") => {
    setCircle(c);
    const next = inCircle(c);
    if (!next.some((w) => w.id === deck)) setDeck(next[Math.floor(Math.random() * next.length)].id);
  };
  const found = (q: Quest) => journal.discoveries.filter((d) => d.quest === q.id);
  const done = QUESTS.filter((q) => found(q).length > 0).length;
  const next = QUESTS.find((q) => found(q).length === 0);
  return (
    <section className="path">
      <div className="intro">
        <p className="kicker">{done} of {QUESTS.length} stones stepped on</p>
        <h1>Your path</h1>
        <p className="muted">Little quests inward. Each one points somewhere; what you find there is yours. Go in any order. Your discoveries, in your own words, become the path.</p>
        <div className="progress" aria-hidden="true"><span style={{ width: `${(done / QUESTS.length) * 100}%` }} /></div>
      </div>
      <ol className="quests">
        {QUESTS.map((q, i) => {
          const finds = found(q);
          const isOpen = open === q.id;
          return (
            <li key={q.id} className={`quest${finds.length ? " done" : ""}${q === next ? " next" : ""}`}>
              <button className="quest-head" aria-expanded={isOpen} onClick={() => { setOpen(isOpen ? null : q.id); setNote(""); }}>
                <span className="stone" aria-hidden="true">{finds.length ? "✓" : i + 1}</span>
                <span><strong>{q.title}</strong><span className="muted small">{q.tagline}</span></span>
              </button>
              {isOpen && (
                <div className="quest-body">
                  <WisdomCard id={q.wisdom} />
                  <p><strong>Your mission:</strong> {q.mission}</p>
                  {finds.length > 0 && <ul className="finds">{finds.map((d) => <li key={d.at}><span className="muted small">{new Date(d.at).toLocaleDateString()}</span>{d.note}</li>)}</ul>}
                  <form onSubmit={(e) => { e.preventDefault(); if (note.trim()) { void act({ action: "discover", quest: q.id, note }); setNote(""); } }}>
                    <label htmlFor={`find-${q.id}`}>{q.ask}</label>
                    <textarea id={`find-${q.id}`} rows={3} maxLength={600} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What you found, in your own words…" />
                    <button className="btn-ink" disabled={!note.trim()}>{finds.length ? "Add another discovery" : "Save my discovery"}</button>
                  </form>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="deck">
        <h2>Wisdom deck</h2>
        <p className="muted">Fingers pointing at the moon, from many teachers across many centuries. Draw one, then go and look for yourself.</p>
        <div className="circles" role="radiogroup" aria-label="Circle of teachers">
          {(["All", ...CIRCLES] as const).map((c) => (
            <button key={c} type="button" role="radio" aria-checked={circle === c} className={circle === c ? "active" : ""} onClick={() => pickCircle(c)}>{c}</button>
          ))}
        </div>
        <p className="kicker">{at + 1} of {cards.length}</p>
        <WisdomCard card={cards[at]} />
        <button className="btn-ghost" onClick={draw}>Draw another</button>
      </div>
    </section>
  );
}

const STATUS_LABEL: Record<NarrativeStatus, string> = { noticed: "Noticed", questioned: "Questioned", "seen-through": "Seen through" };

function Stories({ journal, act }: { journal: Journal; act: (b: unknown) => Promise<void> }) {
  const [story, setStory] = useState("");
  const list = [...journal.narratives].sort((a, b) => (a.status === "seen-through" ? 1 : 0) - (b.status === "seen-through" ? 1 : 0) || b.lastSeen - a.lastSeen);
  return (
    <section className="stories">
      <div className="intro">
        <h1>The stories you tell</h1>
        <p className="muted">Narratives Koan has noticed in your words, or that you&apos;ve added. You don&apos;t have to fight them. Seeing a story as a story is most of the work.</p>
        <form className="add" onSubmit={(e) => { e.preventDefault(); if (story.trim()) { void act({ action: "notice", story, where: "added by you" }); setStory(""); } }}>
          <input value={story} onChange={(e) => setStory(e.target.value)} placeholder="e.g. I have to earn rest" maxLength={140} aria-label="A story you notice" />
          <button className="btn-ink" disabled={!story.trim()}>Add</button>
        </form>
      </div>
      {list.length === 0 && <div className="empty"><Frog size={72} /><p className="muted">No stories caught yet. Don&apos;t worry, they always show up eventually.</p></div>}
      <ul className="narratives">
        {list.map((n) => (
          <li key={n.id} className={`narrative ${n.status}`}>
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

type Running = { startedAt: number; endsAt: number; total: number };

function Stillness({ journal, act, chosen, choose }: { journal: Journal; act: (b: unknown) => Promise<void>; chosen: Practice | Experiment | null; choose: (p: Practice | Experiment | null) => void }) {
  const [minutes, setMinutes] = useState(5);
  const [bell, setBell] = useState<BellId>("bowl");
  const [running, setRunning] = useState<Running | null>(null);
  const [now, setNow] = useState(0);
  const [done, setDone] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const audio = useRef<AudioContext | null>(null);
  const wake = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => setBell(savedBell()), []);
  useEffect(() => { if (chosen && "minutes" in chosen) setMinutes(chosen.minutes); }, [chosen]);

  const release = (closeAfter = 0) => {
    const ctx = audio.current;
    audio.current = null;
    if (ctx) setTimeout(() => void ctx.close().catch(() => {}), closeAfter);
    void wake.current?.release().catch(() => {});
    wake.current = null;
  };

  // The clock ticks on its own, and the time left always comes from the end time,
  // so a slow or throttled tick can never freeze or drift the display.
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= running.endsAt) {
        setRunning(null);
        setDone(running.total / 60);
        release(bellLength(bell) * 1000 + 500);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, [running, bell]);

  useEffect(() => () => release(), []);

  const start = () => {
    const total = minutes * 60;
    const t = Date.now();
    // Both bells are scheduled up front on the audio clock, so the closing bell rings on time
    // even if the browser slows the page's timers while the screen is off or the tab is hidden.
    const ctx = newAudio();
    if (ctx) { strike(ctx, bell); strike(ctx, bell, ctx.currentTime + total); }
    audio.current = ctx;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request("screen").then((l) => { wake.current = l; }).catch(() => {});
    setDone(null);
    setNow(t);
    setRunning({ startedAt: t, endsAt: t + total * 1000, total });
  };
  const stop = () => {
    if (!running) return;
    const m = Math.round((Date.now() - running.startedAt) / 6000) / 10;
    release();
    setRunning(null);
    setDone(m);
  };
  const pickBell = (b: BellId) => { setBell(b); saveBell(b); preview(b); };
  const left = running ? Math.max(0, Math.ceil((running.endsAt - now) / 1000)) : 0;
  const total = journal.sits.reduce((s, x) => s + x.minutes, 0);
  const streak = sitStreak(journal.sits);

  return (
    <section className="stillness">
      <div className="timer">
        {chosen ? <><p className="kicker">{"lens" in chosen ? chosen.lens : "From your conversation"}</p><h1>{chosen.title}</h1><p>{chosen.invitation}</p></> : <><h1>Sit for a while</h1><p className="muted">Pick an experiment below, or just sit. Nothing to achieve. Nobody is grading.</p></>}
        {running ? (
          <>
            <div className="enso-clock">
              <Enso size={220} stroke={7} track progress={Math.max(0.02, 1 - left / running.total)} />
              <p className="clock" aria-live="off">{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</p>
            </div>
            <button className="btn-ghost" onClick={stop}>End early</button>
          </>
        ) : done !== null ? (
          <form className="after" onSubmit={(e) => { e.preventDefault(); void act({ action: "sit", minutes: done, note: [chosen?.title, note].filter(Boolean).join(": ") }); setDone(null); setNote(""); }}>
            <label htmlFor="sit-note">What did you notice? (optional)</label>
            <textarea id="sit-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={180} placeholder="Restless at first, then the birds got very loud…" />
            <div className="row"><button className="btn-ink">Save sit</button><button type="button" className="btn-ghost" onClick={() => setDone(null)}>Don&apos;t save</button></div>
          </form>
        ) : (
          <>
          <div className="bells" role="radiogroup" aria-label="Bell">
            {BELLS.map((b) => <button key={b.id} type="button" role="radio" aria-checked={bell === b.id} className={bell === b.id ? "active" : ""} onClick={() => pickBell(b.id)}>{b.label}</button>)}
          </div>
          <div className="row">
            <label className="mins">Minutes <input type="number" min={1} max={120} value={minutes} onChange={(e) => setMinutes(Math.min(120, Math.max(1, Number(e.target.value) || 1)))} /></label>
            <button className="btn-ink btn-lg" onClick={start}>Begin</button>
            {chosen && <button className="btn-ghost" onClick={() => choose(null)}>Clear</button>}
          </div>
          </>
        )}
        <p className="fine">{journal.sits.length} {journal.sits.length === 1 ? "sit" : "sits"} · {Math.round(total)} {Math.round(total) === 1 ? "minute" : "minutes"}{streak ? ` · ${streak}-day streak` : ""}</p>
      </div>

      <h2>Experiments</h2>
      <ul className="practices">
        {PRACTICES.map((p) => (
          <li key={p.id}>
            <button className={`practice ${p.kind}`} onClick={() => { choose(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <span className="kicker">{p.kind} · {p.minutes} min · {p.lens}</span>
              <strong>{p.title}</strong>
            </button>
          </li>
        ))}
      </ul>

      {journal.sits.length > 0 && (
        <>
          <h2>Recent sits</h2>
          <ul className="sits">{journal.sits.slice(-5).reverse().map((s) => <li key={s.at}><span>{new Date(s.at).toLocaleDateString()} · {s.minutes} min</span>{s.note && <em>{s.note}</em>}</li>)}</ul>
        </>
      )}
    </section>
  );
}
