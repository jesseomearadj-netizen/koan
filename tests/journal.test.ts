import { test } from "node:test";
import assert from "node:assert/strict";
import { addDiscovery, addSit, applyTurn, emptyJournal, LIMITS, noticeNarrative, removeNarrative, sanitizeJournal, setNarrativeStatus, sitStreak, storyKey } from "../lib/journal";
import type { GuideTurn } from "../lib/types";

const turn = (over: Partial<GuideTurn> = {}): GuideTurn => ({ reply: "Is that true?", question: null, narrative: null, experiment: null, wisdom: null, care: false, ...over });

test("similar wordings of a story land on the same narrative", () => {
  assert.equal(storyKey("I'm not good enough."), storyKey("i am not good enough"));
  let j = noticeNarrative(emptyJournal(), "I'm not good enough.", "at work", 1);
  j = noticeNarrative(j, "i am not good enough", "with mum", 2);
  assert.equal(j.narratives.length, 1);
  assert.equal(j.narratives[0].count, 2);
  assert.deepEqual(j.narratives[0].notes, ["at work", "with mum"]);
  assert.equal(j.narratives[0].lastSeen, 2);
});

test("empty stories are ignored and notes are capped", () => {
  assert.equal(noticeNarrative(emptyJournal(), "   ", "x").narratives.length, 0);
  let j = emptyJournal();
  for (let i = 0; i < 10; i++) j = noticeNarrative(j, "People leave", `time ${i}`, i);
  assert.equal(j.narratives[0].notes.length, LIMITS.notes);
  assert.equal(j.narratives[0].notes.at(-1), "time 9");
});

test("status changes accept only known states; removal works", () => {
  let j = noticeNarrative(emptyJournal(), "I must earn rest", "");
  const id = j.narratives[0].id;
  j = setNarrativeStatus(j, id, "seen-through");
  assert.equal(j.narratives[0].status, "seen-through");
  j = setNarrativeStatus(j, id, "bogus" as never);
  assert.equal(j.narratives[0].status, "seen-through");
  assert.equal(removeNarrative(j, id).narratives.length, 0);
});

test("a turn appends both messages and folds in a noticed narrative", () => {
  const j = applyTurn(emptyJournal(), "I always mess things up", turn({ narrative: { story: "I always mess things up", where: "after a meeting" } }), 100);
  assert.equal(j.messages.length, 2);
  assert.equal(j.messages[0].role, "user");
  assert.equal(j.messages[1].role, "guide");
  assert.equal(j.narratives[0].story, "I always mess things up");
});

test("conversation history is bounded", () => {
  let j = emptyJournal();
  for (let i = 0; i < LIMITS.messages; i++) j = applyTurn(j, `msg ${i}`, turn(), i * 10);
  assert.equal(j.messages.length, LIMITS.messages);
  assert.equal(j.messages.at(-2)!.text, `msg ${LIMITS.messages - 1}`);
});

test("sits clamp minutes and drop zero-length ones", () => {
  assert.equal(addSit(emptyJournal(), 0, "").sits.length, 0);
  assert.equal(addSit(emptyJournal(), 9999, "").sits[0].minutes, 240);
  assert.equal(addSit(emptyJournal(), 4.26, "birds").sits[0].minutes, 4.3);
});

test("streak counts consecutive days ending today or yesterday", () => {
  const day = 86_400_000;
  const now = new Date(2026, 9, 7, 12).getTime();
  const sits = [now, now - day, now - 2 * day, now - 4 * day].map((at) => ({ at, minutes: 5, note: "" }));
  assert.equal(sitStreak(sits, now), 3);
  assert.equal(sitStreak(sits.slice(1), now), 2, "a streak survives until the end of today");
  assert.equal(sitStreak([], now), 0);
});

test("sanitize drops malformed records and clips long text", () => {
  const j = sanitizeJournal({ messages: [{ role: "x", text: "no" }, { role: "user", text: "ok", at: 1 }], narratives: [{ id: "a", story: "s".repeat(500), status: "weird", count: -3, notes: [1, "fine"] }, { nope: true }], sits: [{ minutes: 0 }, { at: 1, minutes: 3, note: 7 }] });
  assert.equal(j.messages.length, 1);
  assert.equal(j.narratives.length, 1);
  assert.equal(j.narratives[0].story.length, LIMITS.story);
  assert.equal(j.narratives[0].status, "noticed");
  assert.equal(j.narratives[0].count, 1);
  assert.deepEqual(j.narratives[0].notes, ["fine"]);
  assert.deepEqual(j.sits, [{ at: 1, minutes: 3, note: "" }]);
  assert.deepEqual(sanitizeJournal(null), emptyJournal());
});

test("discoveries need a real quest and words; redoing a quest keeps both", () => {
  assert.equal(addDiscovery(emptyJournal(), "not-a-quest", "hi").discoveries.length, 0);
  assert.equal(addDiscovery(emptyJournal(), "noise", "   ").discoveries.length, 0);
  let j = addDiscovery(emptyJournal(), "noise", "Mostly about lunch", 1);
  j = addDiscovery(j, "noise", "Quieter the second time", 2);
  assert.deepEqual(j.discoveries.map((d) => d.note), ["Mostly about lunch", "Quieter the second time"]);
  assert.equal(sanitizeJournal({ discoveries: [{ quest: "nope", note: "x" }, { quest: "who", note: "a", at: 3 }] }).discoveries.length, 1);
});

test("a guide turn's wisdom card is kept on the message", () => {
  const j = applyTurn(emptyJournal(), "hi", turn({ wisdom: "tolle-watch" }));
  assert.equal(j.messages[1].wisdom, "tolle-watch");
});
