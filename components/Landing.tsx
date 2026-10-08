import Link from "next/link";
import { Enso, Frog, Seal } from "./Ink";
import { Logo } from "./Logo";

const STONES = [
  { title: "Talk", body: "Say what's on your mind. Koan won't hand you answers. It asks the question that turns you back to what's actually here." },
  { title: "Walk the path", body: "Twelve little quests inward: the Noisy Room, the Story Hunter, the Slow Teacher. What you find on each one is yours." },
  { title: "Catch your stories", body: "\"I'm not enough.\" \"I always mess up.\" Koan quietly notices the stories you repeat, so you can watch them lose their grip." },
  { title: "Sit", body: "Sit, listen, walk barefoot, look at the sky. A few minutes done for real beats a library of books about it." },
];

const TEACHERS = ["Jesus", "Buddha", "Lao Tzu", "Chuang Tzu", "Bodhidharma", "Daikaku", "Bukkō", "Bashō", "Ramana", "Nisargadatta", "Kabir", "Rumi", "Rabia", "Heraclitus", "Socrates", "Marcus Aurelius", "Eckhart", "Osho", "Krishnamurti", "Tolle", "Alan Watts", "Bashar", "Neville", "Neuroscience"];

export function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <Link href="/login" className="link">Sign in</Link>
      </header>

      <main>
        <section className="hero">
          <div className="hero-art">
            <Enso size={300} stroke={4.5} className="hero-enso" />
            <Frog size={150} className="hero-frog" />
          </div>
          <div className="hero-copy">
            <p className="kicker">A friendly guide for the inward adventure</p>
            <h1>Sit down.<br />Look around.<br /><span className="brush">Laugh a little.</span></h1>
            <p className="lede">Koan is the friend who keeps asking the good questions. <em>Is that true? Who&apos;s noticing? What&apos;s here before the next thought?</em> It borrows from the old teachers, says it simply, then gets out of the way so you can look for yourself.</p>
            <div className="hero-cta">
              <Link href="/login?mode=signup" className="btn-ink btn-lg">Begin</Link>
              <span className="muted small">No email. Just a username and a little curiosity.</span>
            </div>
          </div>
        </section>

        <section className="exchange" aria-label="An example conversation">
          <p className="me-line">I keep thinking I&apos;m falling behind everyone.</p>
          <div className="guide-line"><Enso size={22} stroke={12} className="avatar" /><div className="guide-body"><p>Behind in what race, exactly? Let&apos;s look. Right now, in this breath, what is actually missing?</p></div></div>
          <p className="caught">story caught · &ldquo;I&apos;m falling behind&rdquo;</p>
        </section>

        <ol className="stones">
          {STONES.map((s, i) => (
            <li key={s.title}>
              <span className="stone" aria-hidden="true">{i + 1}</span>
              <div><h2>{s.title}</h2><p>{s.body}</p></div>
            </li>
          ))}
        </ol>

        <section className="lineage">
          <h2>Many fingers, one moon</h2>
          <p className="muted">Koan borrows from masters, poets and philosophers across thirty centuries, and holds them all lightly. The point is never the finger.</p>
          <ul>{TEACHERS.map((t) => <li key={t}><Seal text={t} />{t}</li>)}</ul>
        </section>

        <section className="sengai">
          <Frog size={64} />
          <p>The Zen monk Sengai drew a frog and wrote: <em>if by sitting in meditation one becomes a Buddha…</em> The frog sits all day. Koan takes the hint: stay light, don&apos;t make a big deal of being holy, and go look.</p>
        </section>
      </main>

      <footer className="landing-foot">
        <p>Koan is a companion for curiosity and self-inquiry, not therapy or medical care. If you&apos;re having a really hard time, please talk to a trusted adult, local emergency services, or a crisis line (988 in the US and Canada, 116 123 in the UK and Ireland).</p>
      </footer>
    </div>
  );
}
