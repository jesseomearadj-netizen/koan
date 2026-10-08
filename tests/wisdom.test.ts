import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTS, WISDOM, wisdomById, wisdomOfDay } from "../lib/wisdom";
import { CIRCLES, TEACHERS } from "../lib/teachers";

test("card and quest ids are unique, and every quest points at a real card", () => {
  assert.equal(new Set(WISDOM.map((w) => w.id)).size, WISDOM.length);
  assert.equal(new Set(QUESTS.map((q) => q.id)).size, QUESTS.length);
  for (const q of QUESTS) assert.ok(wisdomById(q.wisdom), q.id);
});

test("only sourced cards are shown as direct quotes", () => {
  for (const w of WISDOM) if (w.kind === "said") assert.ok(w.source, w.id);
});

test("every teacher Jom named has at least one card", () => {
  for (const t of ["Jesus", "Buddha", "Ramana", "Nisargadatta", "Daikaku", "Bukkō", "Tolle", "Krishnamurti", "Osho", "Bashar", "Neville", "Transurfing", "Crone", "Dispenza", "Neuroscience"]) {
    assert.ok(WISDOM.some((w) => w.teacher.includes(t)), t);
  }
});

test("wisdom of the day is stable within a day", () => {
  const t = Date.UTC(2026, 9, 7, 1);
  assert.equal(wisdomOfDay(t).id, wisdomOfDay(t + 3_600_000).id);
});

test("every card's teacher is in the who's who, and every circle has cards", () => {
  for (const w of WISDOM) assert.ok(TEACHERS[w.teacher], `${w.id}: ${w.teacher}`);
  for (const c of CIRCLES) assert.ok(WISDOM.some((w) => TEACHERS[w.teacher].circle === c), c);
});

test("cards stay short enough to read in one breath", () => {
  for (const w of WISDOM) {
    assert.ok(w.text.length <= 300, w.id);
    assert.ok(w.look.length > 0 && w.look.length <= 160, w.id);
    assert.ok(w.themes.length > 0, w.id);
  }
});
