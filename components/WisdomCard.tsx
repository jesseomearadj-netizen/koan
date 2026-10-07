import { wisdomById, type Wisdom } from "@/lib/wisdom";
import { Seal } from "./Ink";

export function WisdomCard({ id, card, compact }: { id?: string | null; card?: Wisdom; compact?: boolean }) {
  const w = card ?? wisdomById(id);
  if (!w) return null;
  return (
    <figure className={`wisdom${compact ? " compact" : ""}`}>
      <Seal text={w.teacher} />
      {w.kind === "said"
        ? <blockquote>&ldquo;{w.text}&rdquo;</blockquote>
        : <blockquote className="idea">{w.text}</blockquote>}
      <figcaption>{w.kind === "said" ? <>{w.teacher}{w.source && <span> · {w.source}</span>}</> : <>in the spirit of {w.teacher}</>}</figcaption>
      {!compact && <p className="look"><strong>Look for yourself.</strong> {w.look}</p>}
    </figure>
  );
}
