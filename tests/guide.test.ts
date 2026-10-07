import { test } from "node:test";
import assert from "node:assert/strict";

delete process.env.OPENROUTER_API_KEY;

type Guide = typeof import("../lib/server/guide");
const load = async (): Promise<Guide> => import("../lib/server/guide");
const req = new Request("http://localhost/api/guide");
const empty = { v: 1 as const, messages: [], narratives: [], sits: [], discoveries: [] };

test("model output is validated and bounded", async () => {
  const { validateTurn } = await load();
  assert.equal(validateTurn({ reply: "" }), null);
  assert.equal(validateTurn("nonsense"), null);
  const t = validateTurn({ reply: "x".repeat(5000), question: "", narrative: { story: "I'm too much", where: "dinner" }, experiment: { title: "Sky", invitation: "" }, care: false })!;
  assert.equal(t.reply.length, 1500);
  assert.equal(t.question, null);
  assert.deepEqual(t.narrative, { story: "I'm too much", where: "dinner" });
  assert.equal(t.experiment, null, "an experiment needs both a title and an invitation");
});

test("care turns never carry narratives or experiments", async () => {
  const { validateTurn } = await load();
  const t = validateTurn({ reply: "Please reach out.", question: null, narrative: { story: "I'm a burden", where: "" }, experiment: { title: "Sit", invitation: "Sit." }, care: true })!;
  assert.equal(t.care, true);
  assert.equal(t.narrative, null);
  assert.equal(t.experiment, null);
});

test("crisis language gets support resources, even without a model", async () => {
  const { guideTurn, crisisLike } = await load();
  assert.ok(crisisLike("I want to kill myself"));
  assert.ok(!crisisLike("this traffic is killing me"));
  const { turn } = await guideTurn("I've been thinking about suicide", empty, req);
  assert.equal(turn.care, true);
  assert.match(turn.reply, /988/);
});

test("without a key the guide answers with scripted questions", async () => {
  const { guideTurn } = await load();
  const { turn, live } = await guideTurn("I'm anxious about tomorrow", empty, req);
  assert.equal(live, false);
  assert.ok(turn.reply.length > 0);
});

test("the guide can only point at wisdom cards that exist", async () => {
  const { validateTurn } = await load();
  assert.equal(validateTurn({ reply: "Look.", wisdom: "tolle-watch" })!.wisdom, "tolle-watch");
  assert.equal(validateTurn({ reply: "Look.", wisdom: "made-up-quote" })!.wisdom, null);
  assert.equal(validateTurn({ reply: "Reach out.", wisdom: "tolle-watch", care: true })!.wisdom, null);
});
