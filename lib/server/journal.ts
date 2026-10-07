import "server-only";
import type { Journal } from "@/lib/types";
import { emptyJournal, sanitizeJournal } from "@/lib/journal";
import { readDoc, writeDoc } from "./store";

export async function loadJournal(userId: string): Promise<Journal> {
  const doc = await readDoc<Journal>(`journals/${userId}`);
  return doc ? sanitizeJournal(doc) : emptyJournal();
}

export async function saveJournal(userId: string, j: Journal) {
  await writeDoc(`journals/${userId}`, j);
}
