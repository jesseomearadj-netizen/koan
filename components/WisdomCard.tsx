import { wisdomById, type Wisdom } from "@/lib/wisdom";
import { teacherInfo } from "@/lib/teachers";
import { Seal } from "./Ink";

export function WisdomCard({ id, card, compact }: { id?: string | null; card?: Wisdom; compact?: boolean }) {
  const w = card ?? wisdomById(id);
  if (!w) return null;
  const about = teacherInfo(w.teacher).about;
  return (
    <figure className={`wisdom${compact ? " compact" : ""}`}>
      <Seal text={w.teacher} />
      {w.kind === "said"
        ? <blockquote>&ldquo;{w.text.split(" / ").map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}&rdquo;</blockquote>
        : <blockquote className="idea">{w.text}</blockquote>}
      <figcaption>{w.kind === "said" ? <>{w.teacher}{w.source && <span> · {w.source}</span>}</> : <>in the spirit of {w.teacher}</>}</figcaption>
      {!compact && about && <p className="about">{about}</p>}
      {!compact && <p className="look"><strong>Look for yourself.</strong> {w.look}</p>}
    </figure>
  );
}
