import type { Discovery, GuideTurn, Journal, Message, Narrative, NarrativeStatus, Sit } from "./types";
import { questById } from "./wisdom";

/** Pure journal logic, shared by server routes and tests. */

export const LIMITS = { messages: 60, narratives: 80, sits: 365, notes: 6, story: 140, note: 200, text: 2000, discovery: 600, discoveries: 200 };
const STATUSES: NarrativeStatus[] = ["noticed", "questioned", "seen-through"];

export const emptyJournal = (): Journal => ({ v: 1, messages: [], narratives: [], sits: [], discoveries: [] });

const clip = (s: unknown, n: number) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, n) : "");

/** Loose key so "I'm not good enough." and "i am not good enough" land on the same narrative. */
export function storyKey(story: string) {
  return story.toLowerCase().replace(/\bi'm\b/g, "i am").replace(/\bcan't\b/g, "cannot").replace(/[^a-z0-9 ]+/g, "").replace(/\s+/g, " ").trim();
}

export function newId(now = Date.now()) {
  return `${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Records a sighting of a narrative: bumps an existing one or adds a new one. */
export function noticeNarrative(j: Journal, story: string, where: string, now = Date.now()): Journal {
  const s = clip(story, LIMITS.story);
  if (!s) return j;
  const k = storyKey(s);
  const note = clip(where, LIMITS.note);
  const existing = j.narratives.find((n) => storyKey(n.story) === k);
  let narratives: Narrative[];
  if (existing) {
    narratives = j.narratives.map((n) => (n === existing ? { ...n, count: n.count + 1, lastSeen: now, notes: note ? [...n.notes, note].slice(-LIMITS.notes) : n.notes } : n));
  } else {
    narratives = [...j.narratives, { id: newId(now), story: s, status: "noticed" as const, count: 1, firstSeen: now, lastSeen: now, notes: note ? [note] : [] }].slice(-LIMITS.narratives);
  }
  return { ...j, narratives };
}

export function setNarrativeStatus(j: Journal, id: string, status: NarrativeStatus): Journal {
  if (!STATUSES.includes(status)) return j;
  return { ...j, narratives: j.narratives.map((n) => (n.id === id ? { ...n, status } : n)) };
}

export function removeNarrative(j: Journal, id: string): Journal {
  return { ...j, narratives: j.narratives.filter((n) => n.id !== id) };
}

export function addSit(j: Journal, minutes: number, note: string, now = Date.now()): Journal {
  const m = Math.round(Math.min(240, Math.max(0, Number(minutes) || 0)) * 10) / 10;
  if (m <= 0) return j;
  const sit: Sit = { at: now, minutes: m, note: clip(note, LIMITS.note) };
  return { ...j, sits: [...j.sits, sit].slice(-LIMITS.sits) };
}

/** Records what someone found on a quest. Redoing a quest adds a new discovery; the path keeps them all. */
export function addDiscovery(j: Journal, quest: string, note: string, now = Date.now()): Journal {
  const n = clip(note, LIMITS.discovery);
  if (!questById(quest) || !n) return j;
  const d: Discovery = { quest, note: n, at: now };
  return { ...j, discoveries: [...j.discoveries, d].slice(-LIMITS.discoveries) };
}

/** Appends one exchange and folds any narrative the guide noticed into the tracker. */
export function applyTurn(j: Journal, text: string, turn: GuideTurn, now = Date.now()): Journal {
  const user: Message = { role: "user", text: clip(text, LIMITS.text), at: now };
  const guide: Message = { role: "guide", text: turn.reply, at: now + 1, question: turn.question, experiment: turn.experiment, wisdom: turn.wisdom, ...(turn.care ? { care: true } : {}) };
  let next: Journal = { ...j, messages: [...j.messages, user, guide].slice(-LIMITS.messages) };
  if (turn.narrative) next = noticeNarrative(next, turn.narrative.story, turn.narrative.where, now);
  return next;
}

/** Consecutive days (ending today or yesterday) with at least one sit. */
export function sitStreak(sits: Sit[], now = Date.now()) {
  const day = (t: number) => Math.floor((t - new Date(t).getTimezoneOffset() * 60_000) / 86_400_000);
  const days = new Set(sits.map((s) => day(s.at)));
  let d = day(now);
  if (!days.has(d)) d -= 1;
  let streak = 0;
  while (days.has(d)) { streak++; d--; }
  return streak;
}

/** Validates a stored or client-supplied journal; drops anything malformed. */
export function sanitizeJournal(raw: unknown): Journal {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Journal>;
  const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : 0);
  const messages = (Array.isArray(r.messages) ? r.messages : []).filter((m) => m && (m.role === "user" || m.role === "guide") && typeof m.text === "string").slice(-LIMITS.messages);
  const narratives = (Array.isArray(r.narratives) ? r.narratives : [])
    .filter((n) => n && typeof n.id === "string" && typeof n.story === "string")
    .map((n) => ({ id: n.id, story: clip(n.story, LIMITS.story), status: STATUSES.includes(n.status) ? n.status : "noticed", count: Math.max(1, num(n.count)), firstSeen: num(n.firstSeen), lastSeen: num(n.lastSeen), notes: (Array.isArray(n.notes) ? n.notes : []).map((x) => clip(x, LIMITS.note)).filter(Boolean).slice(-LIMITS.notes) }) as Narrative)
    .slice(-LIMITS.narratives);
  const sits = (Array.isArray(r.sits) ? r.sits : []).filter((s) => s && num(s.minutes) > 0).map((s) => ({ at: num(s.at), minutes: num(s.minutes), note: clip(s.note, LIMITS.note) })).slice(-LIMITS.sits);
  const discoveries = (Array.isArray(r.discoveries) ? r.discoveries : []).filter((d) => d && questById(d.quest) && typeof d.note === "string").map((d) => ({ quest: d.quest, note: clip(d.note, LIMITS.discovery), at: num(d.at) })).slice(-LIMITS.discoveries);
  return { v: 1, messages, narratives, sits, discoveries };
}
