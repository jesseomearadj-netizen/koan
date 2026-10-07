import Link from "next/link";
import { Logo } from "./Logo";

const PILLARS = [
  { title: "Talk it through", body: "Say what's on your mind. Koan won't hand you answers; it asks the question that turns you back toward what's actually here." },
  { title: "Catch your stories", body: "\"I'm not enough.\" \"People always leave.\" Koan quietly notes the narratives you repeat, so you can watch them lose their grip." },
  { title: "Go on quests", body: "A path of playful little adventures inward: the Noisy Room, the Story Hunter, the Slow Teacher. Each one comes with a piece of old wisdom, and what you discover there is yours." },
  { title: "Experiment with stillness", body: "Small invitations to sit, listen, walk barefoot or look at the sky. A few minutes, done for real, beats any amount of reading." },
];

const LENSES = ["Jesus", "Buddha", "Sri Ramana Maharshi", "Nisargadatta Maharaj", "Zen", "Lao Tzu", "Eckhart Tolle", "Krishnamurti", "Osho", "Bashar", "Neville Goddard", "Transurfing", "Peter Crone", "Joe Dispenza", "Neuroscience"];

export function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <nav>
          <Link href="/login" className="btn-ghost">Sign in</Link>
          <Link href="/login?mode=signup" className="btn-primary">Begin</Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <p className="kicker">A mindful friend, with an old teacher&apos;s eyes</p>
          <h1>Not another voice in your head.<br /><em>A friend who points back to you.</em></h1>
          <p className="lede">Koan keeps things light and keeps asking the good questions: <q>Is that true?</q> <q>Who is noticing?</q> <q>What&apos;s here before the next thought?</q> It brings in the great teachers in simple words, then gets out of the way so you can look for yourself. Simple enough for a curious twelve-year-old, deep enough for anyone.</p>
          <div className="hero-cta">
            <Link href="/login?mode=signup" className="btn-primary btn-lg">Start the journey</Link>
            <span className="muted">No email. Just a username.</span>
          </div>
          <div className="hero-chat" aria-hidden="true">
            <span className="bubble me">I keep thinking I&apos;m falling behind everyone.</span>
            <span className="bubble guide">Behind on what race, exactly? Let&apos;s look. Right now, in this breath, what is actually missing?</span>
            <span className="chip">Story noticed · &ldquo;I&apos;m falling behind&rdquo;</span>
          </div>
        </section>

        <section className="pillars">
          {PILLARS.map((p) => (
            <article key={p.title} className="card">
              <h2>{p.title}</h2>
              <p>{p.body}</p>
            </article>
          ))}
        </section>

        <section className="lenses">
          <h2>Many fingers, one moon</h2>
          <p className="muted">Koan borrows lenses from teachers and science, and holds them lightly. The point is never the teacher. It&apos;s your own seeing.</p>
          <ul>{LENSES.map((l) => <li key={l}>{l}</li>)}</ul>
        </section>
      </main>

      <footer className="landing-foot">
        <p>Koan is a companion for self-inquiry, not therapy or medical care. If you&apos;re in crisis, please contact local emergency services or a crisis line (988 in the US and Canada).</p>
      </footer>
    </div>
  );
}
