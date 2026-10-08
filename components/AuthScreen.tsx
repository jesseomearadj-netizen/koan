"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Logo } from "./Logo";
import { Frog } from "./Ink";

type AuthMode = "signin" | "signup";
const STATUS: Record<number, string> = { 401: "That username and password don’t match.", 409: "That username is taken. Try another, or sign in.", 429: "Too many attempts. Wait a minute, then try again." };

export function AuthScreen({ initialMode }: { initialMode: AuthMode }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [oldEnough, setOldEnough] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ids = { user: useId(), pass: useId(), err: useId() };
  const signup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const u = username.trim();
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,23}$/.test(u)) { setError("Usernames are 3–24 characters: letters, numbers, dots, dashes or underscores."); return; }
    if (password.length < 8) { setError("Use at least 8 characters for your password."); return; }
    if (signup && !oldEnough) { setError("Koan accounts are for people 13 and older."); return; }
    setBusy(true);
    setError("");
    try {
      const r = await fetch(signup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
        body: JSON.stringify(signup ? { username: u, password, over13: oldEnough } : { username: u, password }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(STATUS[r.status] || body.error || "Something went wrong. Try again.");
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(navigator.onLine ? (err as Error).message : "You’re offline. Connect to sign in.");
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <Link href="/" className="auth-logo"><Logo /></Link>
      <main className="auth-card">
        <Frog size={72} className="auth-frog" />
        <div className="seg" role="tablist" aria-label="Account">
          <button role="tab" type="button" aria-selected={signup} className={signup ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Begin</button>
          <button role="tab" type="button" aria-selected={!signup} className={!signup ? "active" : ""} onClick={() => { setMode("signin"); setError(""); }}>Sign in</button>
        </div>
        <h1>{signup ? "Begin where you are" : "Welcome back"}</h1>
        <p className="muted">{signup ? "Pick a username and a password. That's the whole ceremony." : "Your path, stories and sits are right where you left them."}</p>
        <form onSubmit={submit} noValidate>
          <label htmlFor={ids.user}>Username</label>
          <input id={ids.user} autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. quiet_river" aria-describedby={error ? ids.err : undefined} />
          <label htmlFor={ids.pass}>Password</label>
          <input id={ids.pass} type="password" autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={signup ? "At least 8 characters" : "Your password"} />
          {signup && <label className="check"><input type="checkbox" checked={oldEnough} onChange={(e) => setOldEnough(e.target.checked)} /> I&apos;m 13 or older</label>}
          {error && <p id={ids.err} className="error" role="alert">{error}</p>}
          <button className="btn-ink btn-lg" disabled={busy}>{busy ? (signup ? "Creating your account…" : "Signing in…") : (signup ? "Create account" : "Sign in")}</button>
        </form>
        <p className="fine">There&apos;s no password reset yet, so pick one you&apos;ll remember. What you write is sent to an AI provider to generate the guide&apos;s replies.</p>
      </main>
    </div>
  );
}
