import { test } from "node:test";
import assert from "node:assert/strict";

// A fake key and a fake provider, so the live path runs without the network.
process.env.OPENROUTER_API_KEY = "sk-or-test";
process.env.APP_MODE = "live";

type Body = { messages: { role: string; content: string }[] };
const sent: Body[] = [];
let answer = "";
globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
  sent.push(JSON.parse(String(init?.body)));
  return new Response(JSON.stringify({ choices: [{ message: { content: answer }, finish_reason: "stop" }] }), { status: 200 });
}) as typeof fetch;

const req = new Request("http://localhost/api/guide");
const journal = {
  v: 1 as const, narratives: [], sits: [], discoveries: [],
  messages: [
    { role: "user" as const, text: "Something good happened and I don't trust it.", at: 1 },
    { role: "guide" as const, text: "Winning can feel jumpy too.", question: "What is your body bracing against?", wisdom: null, experiment: null, at: 2 },
  ],
};

test("earlier guide turns are sent back as JSON, so the model keeps answering in JSON", async () => {
  const { guideTurn } = await import("../lib/server/guide");
  answer = JSON.stringify({ reply: "Stay with the tension a moment.", question: null, narrative: null, experiment: null, wisdom: null, care: false });
  const { turn, live } = await guideTurn("I still feel tense in my stomach.", journal, req);
  assert.equal(live, true);
  assert.equal(turn.reply, "Stay with the tension a moment.");
  const prior = sent.at(-1)!.messages.find((m) => m.role === "assistant")!;
  assert.deepEqual(JSON.parse(prior.content).question, "What is your body bracing against?");
});

test("a reply wrapped in prose or sent as plain prose is still read", async () => {
  const { guideTurn } = await import("../lib/server/guide");
  answer = 'Sure! Here you go: {"reply": "Breathe out slowly.", "question": null, "narrative": null, "experiment": null, "wisdom": null, "care": false}';
  assert.equal((await guideTurn("Still tense.", journal, req)).turn.reply, "Breathe out slowly.");
  answer = "Let the breath be long and slow. Notice what softens.";
  assert.equal((await guideTurn("Still tense.", journal, req)).turn.reply, "Let the breath be long and slow. Notice what softens.");
});

test("an answer with a broken object is still an error", async () => {
  const { parseLooseJSON } = await import("../lib/server/openrouter");
  assert.equal(parseLooseJSON('{"reply": "cut off mid'), undefined);
  assert.equal(parseLooseJSON("   "), undefined);
  assert.deepEqual(parseLooseJSON('```json\n{"reply":"hi"}\n```'), { reply: "hi" });
});
