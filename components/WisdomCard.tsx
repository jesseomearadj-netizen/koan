import { wisdomById, type Wisdom } from "@/lib/wisdom";

export function WisdomCard({ id, card, compact }: { id?: string | null; card?: Wisdom; compact?: boolean }) {
  const w = card ?? wisdomById(id);
  if (!w) return null;
  return (
    <figure className={`wisdom${compact ? " compact" : ""}`}>
      {w.kind === "said"
        ? <blockquote>&ldquo;{w.text}&rdquo;</blockquote>
        : <blockquote className="idea">{w.text}</blockquote>}
      <figcaption>{w.kind === "said" ? <>{w.teacher}{w.source && <span> · {w.source}</span>}</> : <>In the spirit of {w.teacher}</>}</figcaption>
      {!compact && <p className="look"><strong>Look for yourself:</strong> {w.look}</p>}
    </figure>
  );
}
