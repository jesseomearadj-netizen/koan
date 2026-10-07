import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Isolated local store (no Blob token) in a temp dir; the store resolves its folder at import time.
const dir = mkdtempSync(path.join(tmpdir(), "koan-auth-"));
const cwd = process.cwd();
process.chdir(dir);
delete process.env.BLOB_READ_WRITE_TOKEN;
process.env.AUTH_SECRET = "test-secret-that-is-long-enough-for-hmac-signing-000";

type Auth = typeof import("../lib/server/auth");
let auth: Auth;
before(async () => { auth = await import("../lib/server/auth"); });
after(() => { process.chdir(cwd); rmSync(dir, { recursive: true, force: true }); });

test("usernames are normalized and validated", () => {
  assert.equal(auth.normalizeUsername("  Traveling_Sam "), "traveling_sam");
  assert.throws(() => auth.normalizeUsername("ab"), /3–24/);
  assert.throws(() => auth.normalizeUsername("has space"), /3–24/);
  assert.throws(() => auth.normalizeUsername("-leadingdash"), /3–24/);
  assert.throws(() => auth.normalizeUsername(42), /3–24/);
});

test("passwords need 8–128 characters", () => {
  assert.throws(() => auth.checkPassword("short"), /8 characters/);
  assert.throws(() => auth.checkPassword("x".repeat(129)), /too long/);
  assert.equal(auth.checkPassword("longenough"), "longenough");
});

test("create, verify, reject wrong password, reject duplicates", async () => {
  const u = await auth.createAccount("maria_t", "correct horse");
  assert.equal(u.username, "maria_t");
  assert.deepEqual(await auth.verifyAccount("maria_t", "correct horse"), u);
  await assert.rejects(auth.verifyAccount("maria_t", "wrong horse!"), /don’t match/);
  await assert.rejects(auth.verifyAccount("nobody_here", "correct horse"), /don’t match/);
  await assert.rejects(auth.createAccount("maria_t", "another pass"), /taken/);
});

test("account ids do not depend on the session secret", () => {
  const a = auth.accountId("maria_t");
  process.env.AUTH_SECRET = "a-completely-different-secret-value-0000000000000";
  assert.equal(auth.accountId("maria_t"), a);
  process.env.AUTH_SECRET = "test-secret-that-is-long-enough-for-hmac-signing-000";
});

test("session tokens round-trip and reject tampering and expiry", () => {
  const user = { id: "abc123", username: "maria_t" };
  const now = Date.now();
  const t = auth.sessionToken(user, now);
  assert.deepEqual(auth.readSessionToken(t, now + 1000), user);
  const [payload, sig] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ i: "abc123", u: "admin", e: now + 1e9 })).toString("base64url");
  assert.equal(auth.readSessionToken(`${forged}.${sig}`, now), null);
  assert.equal(auth.readSessionToken(`${payload}.${sig.slice(0, -2)}xx`, now), null);
  assert.equal(auth.readSessionToken(t, now + 91 * 86_400_000), null, "expires after 90 days");
  assert.equal(auth.readSessionToken("garbage", now), null);
  assert.equal(auth.readSessionToken(undefined, now), null);
});

test("rotating the secret invalidates existing sessions", () => {
  const t = auth.sessionToken({ id: "abc", username: "maria_t" });
  process.env.AUTH_SECRET = "rotated-secret-rotated-secret-rotated-secret-0000";
  assert.equal(auth.readSessionToken(t), null);
  process.env.AUTH_SECRET = "test-secret-that-is-long-enough-for-hmac-signing-000";
});

test("sign-out cookie expires immediately", () => {
  assert.match(auth.sessionSetCookie(""), /Max-Age=0/);
  assert.match(auth.sessionSetCookie("tok"), /HttpOnly; SameSite=Lax/);
});
