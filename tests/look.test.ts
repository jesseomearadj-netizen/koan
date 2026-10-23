import { test } from "node:test";
import assert from "node:assert/strict";
import { applyLook, emptyJournal, LIMITS, sanitizeJournal } from "../lib/journal";
import { LENSES, lensById, splitCharged } from "../lib/lenses";
import type { GuideTurn } from "../lib/types";

delete process.env.OPENROUTER_API_KEY;

const turn = (over: Partial<GuideTurn> = {}): GuideTurn => ({ reply: "Hmm.", question: "Who gave you that idea?", narrative: null, experiment: null, wisdom: null, care: false, ...over });

test("there are five doors, each with starters and guidance", () => {
  assert.deepEqual(LENSES.map((l) => l.id), ["belief", "importance", "part", "edge", "noise"]);
  for (const l of LENSES) {
    assert.ok(l.starters.length >= 3 && l.guidance.length > 100, l.id);
    assert.equal(lensById(l.id), l);
  }
  assert.equal(lensById("nope"), undefined);
});

test("charged words are picked out, and nothing else", () => {
  const parts = splitCharged("I should always be perfect, and I have to win.");
  assert.deepEqual(parts.filter((p) => p.charged).map((p) => p.text), ["should", "always", "perfect", "have to"]);
  assert.equal(parts.map((p) => p.text).join(""), "I should always be perfect, and I have to win.");
  assert.deepEqual(splitCharged("A calm day."), [{ text: "A calm day.", charged: false }]);
  assert.deepEqual(splitCharged("Shouldn't Everyone"), [{ text: "Shouldn't", charged: true }, { text: " ", charged: false }, { text: "Everyone", charged: true }]);
});

test("a look is kept apart from Talk, and its beliefs land in Stories", () => {
  const j = applyLook(emptyJournal(), "I have to be perfect.", "belief", turn({ narrative: { story: "I have to be perfect", where: "school" } }), 100);
  assert.equal(j.messages.length, 0);
  assert.deepEqual(j.looks.map((m) => [m.role, m.lens]), [["user", "belief"], ["guide", "belief"]]);
  assert.equal(j.narratives[0].story, "I have to be perfect");
  assert.deepEqual(j.narratives[0].notes, ["Look: school"]);
});

test("looks are capped, and old or broken journals load", () => {
  let j = emptyJournal();
  for (let i = 0; i < LIMITS.looks; i++) j = applyLook(j, `look ${i}`, "part", turn(), i * 10);
  assert.equal(j.looks.length, LIMITS.looks);
  const old = sanitizeJournal({ messages: [], narratives: [], sits: [], discoveries: [] });
  assert.deepEqual(old.looks, []);
  const mixed = sanitizeJournal({ looks: [{ role: "user", text: "hi", at: 1, lens: "edge" }, { role: "user", text: "no door", at: 2 }, { role: "guide", text: "bad door", at: 3, lens: "x" }] });
  assert.deepEqual(mixed.looks.map((m) => m.text), ["hi"]);
});

test("demo mode answers each door in its own way, and crisis words still get care", async () => {
  const { guideTurn } = await import("../lib/server/guide");
  const req = new Request("http://localhost/api/guide");
  const a = await guideTurn("I have to win.", emptyJournal(), req, "importance");
  assert.match(a.turn.question ?? "", /1 to 10/);
  const b = await guideTurn("A part of me is scared.", emptyJournal(), req, "part");
  assert.match(b.turn.question ?? "", /body/);
  const n = await guideTurn("Everyone is arguing.", emptyJournal(), req, "noise");
  assert.match(n.turn.question ?? "", /in here/);
  const c = await guideTurn("I want to kill myself", emptyJournal(), req, "belief");
  assert.equal(c.turn.care, true);
});
