import { test } from "node:test";
import assert from "node:assert/strict";
import { STARTERS, pickStarters } from "../lib/starters";

test("starters are short, distinct and plenty", () => {
  assert.ok(STARTERS.length >= 30);
  assert.equal(new Set(STARTERS).size, STARTERS.length);
  for (const s of STARTERS) assert.ok(s.length <= 60, s);
});

test("a pick is four different starters, and picks vary", () => {
  const a = pickStarters();
  assert.equal(a.length, 4);
  assert.equal(new Set(a).size, 4);
  const seen = new Set(Array.from({ length: 20 }, () => pickStarters().join("|")));
  assert.ok(seen.size > 1);
});

test("each starter in a pick comes from a different mood", async () => {
  const { STARTER_GROUPS } = await import("../lib/starters");
  for (let i = 0; i < 50; i++) {
    const groups = pickStarters().map((s) => STARTER_GROUPS.findIndex((g) => g.includes(s)));
    assert.equal(new Set(groups).size, 4);
  }
});
