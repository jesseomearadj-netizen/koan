// Meditation bells, synthesised with Web Audio so there are no sound files to ship or license.
// Each bell is a few inharmonic partials with long decays; paired, slightly detuned sines give
// the slow "wah-wah" beating of a real bowl.

export type BellId = "bowl" | "tingsha" | "none";

export const BELLS: { id: BellId; label: string }[] = [
  { id: "bowl", label: "Singing bowl" },
  { id: "tingsha", label: "Tingsha" },
  { id: "none", label: "Silent" },
];

type Partial = { ratio: number; gain: number; decay: number; attack?: number; beat?: number };

const VOICES: Record<Exclude<BellId, "none">, { base: number; partials: Partial[]; mallet: number; length: number; level: number }> = {
  // Ratios close to a measured Tibetan bowl (1 : 2.7 : 5.2 : 8.4).
  bowl: {
    base: 196, mallet: 0.04, length: 12, level: 1,
    partials: [
      { ratio: 1, gain: 1, decay: 10, beat: 0.6 },
      { ratio: 2.71, gain: 0.55, decay: 7, beat: 1.1 },
      { ratio: 5.18, gain: 0.22, decay: 3.5, beat: 1.7 },
      { ratio: 8.37, gain: 0.1, decay: 1.8 },
    ],
  },
  // Two small cymbals touched together: bright, with fast shimmering beats.
  tingsha: {
    base: 2350, mallet: 0.02, length: 6, level: 0.75,
    partials: [
      { ratio: 1, gain: 1, decay: 5, beat: 7 },
      { ratio: 1.63, gain: 0.35, decay: 3, beat: 5 },
      { ratio: 2.41, gain: 0.15, decay: 1.6 },
    ],
  },
};

/** Schedule one strike of `bell` at `at` seconds on the context's clock. */
export function strike(ctx: AudioContext, bell: BellId, at = ctx.currentTime, volume = 0.28) {
  if (bell === "none") return;
  const voice = VOICES[bell];
  const out = ctx.createGain();
  out.gain.value = voice.level * volume / voice.partials.reduce((s, p) => s + p.gain, 0) * 1.6;
  out.connect(ctx.destination);

  for (const p of voice.partials) {
    const freqs = p.beat ? [voice.base * p.ratio, voice.base * p.ratio + p.beat] : [voice.base * p.ratio];
    for (const f of freqs) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const peak = p.gain / freqs.length;
      const attack = p.attack ?? 0.008;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(peak, at + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, at + attack + p.decay);
      o.connect(g).connect(out);
      o.start(at);
      o.stop(at + attack + p.decay + 0.1);
    }
  }

  // A short filtered noise burst for the mallet's touch.
  const len = Math.floor(ctx.sampleRate * voice.mallet);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = voice.base * 3;
  const ng = ctx.createGain();
  ng.gain.value = 0.25;
  noise.connect(filter).connect(ng).connect(out);
  noise.start(at);
}

export const bellLength = (bell: BellId) => (bell === "none" ? 0 : VOICES[bell].length);

export function newAudio(): AudioContext | null {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Play a bell once, for previews. */
export function preview(bell: BellId) {
  if (bell === "none") return;
  const ctx = newAudio();
  if (!ctx) return;
  strike(ctx, bell);
  setTimeout(() => void ctx.close().catch(() => {}), bellLength(bell) * 1000 + 500);
}

const KEY = "koan-bell";
export function savedBell(): BellId {
  try {
    const v = localStorage.getItem(KEY);
    if (BELLS.some((b) => b.id === v)) return v as BellId;
  } catch { /* storage blocked */ }
  return "bowl";
}
export function saveBell(bell: BellId) {
  try { localStorage.setItem(KEY, bell); } catch { /* storage blocked */ }
}

const CLOCK_KEY = "koan-show-clock";
export function savedShowClock(): boolean {
  try { return localStorage.getItem(CLOCK_KEY) !== "0"; } catch { return true; }
}
export function saveShowClock(show: boolean) {
  try { localStorage.setItem(CLOCK_KEY, show ? "1" : "0"); } catch { /* storage blocked */ }
}
