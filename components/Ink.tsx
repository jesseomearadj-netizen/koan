/** Hand-drawn bits: an ensō with a brushy edge, Sengai's frog, a hanko seal, and little ink icons. */

/** A brush ensō. `progress` (0–1) draws it in, used by the sit timer. */
export function Enso({ size = 120, progress = 0.92, stroke = 10, track, className }: { size?: number; progress?: number; stroke?: number; track?: boolean; className?: string }) {
  // Same filter everywhere, so a fixed id is safe to repeat and stable across server and client renders.
  const id = "ink-brush";
  const r = 50 - stroke;
  const c = 2 * Math.PI * r;
  return (
    <svg className={className} viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="3.2" />
        </filter>
      </defs>
      {track && <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth={stroke * 0.35} />}
      <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${c * Math.max(0.001, Math.min(1, progress))} ${c}`} transform="rotate(-70 50 50)" filter={`url(#${id})`} style={{ transition: "stroke-dasharray 1s linear" }} />
    </svg>
  );
}

/** After Sengai's frog: "If by sitting in meditation one becomes a Buddha…" */
export function Frog({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 100" width={size} height={(size * 100) / 120} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 84c-6-10-4-28 8-40 8-8 13-11 15-19 2-7 9-10 15-6 3-3 8-3 11 0 6-4 13-1 15 6 2 8 7 11 15 19 12 12 14 30 8 40" />
      <path d="M16 84c10 4 30 6 44 6s34-2 44-6" />
      <circle cx="47" cy="26" r="3.4" fill="currentColor" stroke="none" />
      <circle cx="73" cy="26" r="3.4" fill="currentColor" stroke="none" />
      <path d="M44 42c8 7 24 7 32 0" />
      <path d="M30 74c4-6 10-8 14-6M90 74c-4-6-10-8-14-6" />
    </svg>
  );
}

/** A small vermilion seal with a teacher's initial. */
export function Seal({ text }: { text: string }) {
  return <span className="seal" aria-hidden="true">{text.replace(/^(Sri |Zen story|Daikaku \(Zen\))/, (m) => (m.startsWith("Sri") ? "" : m.startsWith("Daikaku") ? "D" : "禅")).trim().charAt(0)}</span>;
}

export type IconName = "talk" | "path" | "stories" | "sit";

export function Icon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", width: 24, height: 24, fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "talk": return <svg {...common}><path d="M4 12c0-4 3.6-7 8-7s8 3 8 7-3.6 7-8 7c-1.2 0-2.3-.2-3.3-.6L4.5 20l1.1-3.6C4.6 15.2 4 13.7 4 12Z" /></svg>;
    case "path": return <svg {...common}><ellipse cx="7" cy="18" rx="3" ry="2" /><ellipse cx="15" cy="12.5" rx="3" ry="2" /><ellipse cx="9" cy="6.5" rx="2.6" ry="1.8" /></svg>;
    case "stories": return <svg {...common}><path d="M5 4h10l4 4v12H5z" /><path d="M9 11h6M9 15h4" /></svg>;
    case "sit": return <svg {...common}><path d="M19.5 9.5A8 8 0 1 1 13 4.1" /></svg>;
  }
}
