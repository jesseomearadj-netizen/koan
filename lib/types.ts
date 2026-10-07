export type NarrativeStatus = "noticed" | "questioned" | "seen-through";

/** A story the mind keeps telling ("I'm not enough", "People leave"). Tracked so it can be seen, not fixed. */
export interface Narrative {
  id: string;
  story: string;
  status: NarrativeStatus;
  count: number;
  firstSeen: number;
  lastSeen: number;
  /** Short notes on where it showed up, newest last. */
  notes: string[];
}

export interface Message { role: "user" | "guide"; text: string; at: number; question?: string | null; experiment?: Experiment | null; wisdom?: string | null; care?: boolean }

export interface Experiment { title: string; invitation: string }

export interface Sit { at: number; minutes: number; note: string }

/** What someone found on a quest, in their own words. Their path is made of these. */
export interface Discovery { quest: string; note: string; at: number }

export interface Journal { v: 1; messages: Message[]; narratives: Narrative[]; sits: Sit[]; discoveries: Discovery[] }

/** What the guide returns for one turn (validated server-side). */
export interface GuideTurn {
  reply: string;
  question: string | null;
  narrative: { story: string; where: string } | null;
  experiment: Experiment | null;
  /** id of a wisdom card from lib/wisdom.ts, or null. */
  wisdom: string | null;
  care: boolean;
}
