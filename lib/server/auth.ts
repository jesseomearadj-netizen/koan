import "server-only";
import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { ConflictError, readDoc, writeDoc } from "./store";
import { HttpError } from "./guard";

/**
 * Simple username + password accounts. Deliberately small: scrypt password hashes, an HMAC-signed
 * session cookie, no email or recovery yet. Replace with a full identity provider before scale.
 */

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: { N: number; r: number; p: number; maxmem: number }) => Promise<Buffer>;
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export const SESSION_COOKIE = "koan_session";
const SESSION_DAYS = 90;

export interface SessionUser { id: string; username: string }
interface AccountDoc { v: 1; id: string; username: string; salt: string; hash: string; createdAt: number }

let warned = false;
function secret(): string {
  const s = process.env.AUTH_SECRET?.trim();
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new HttpError(503, "Sign-in is not configured on this server yet.");
  if (!warned) { console.warn("[koan] AUTH_SECRET is not set; using an insecure development secret."); warned = true; }
  return "koan-development-only-secret-do-not-use-in-production";
}

const b64url = (b: Buffer) => b.toString("base64url");
const sign = (data: string) => b64url(createHmac("sha256", secret()).update(data).digest());

/**
 * Stable storage id for a username. Blobs are private, so this only needs to be stable—not secret—and it
 * deliberately does not depend on AUTH_SECRET: rotating the secret signs everyone out but orphans no accounts.
 */
export const accountId = (username: string) => createHash("sha256").update(`koan-account:${username}`).digest("hex").slice(0, 40);

export function normalizeUsername(raw: unknown): string {
  const u = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!/^[a-z0-9][a-z0-9_.-]{2,23}$/.test(u)) throw new HttpError(400, "Usernames are 3–24 characters: letters, numbers, dots, dashes or underscores.");
  return u;
}

export function checkPassword(raw: unknown): string {
  const p = typeof raw === "string" ? raw : "";
  if (p.length < 8) throw new HttpError(400, "Use at least 8 characters for your password.");
  if (p.length > 128) throw new HttpError(400, "That password is too long (128 characters max).");
  return p;
}

async function hashPassword(password: string, salt: Buffer) {
  return scrypt(password.normalize("NFKC"), salt, 64, SCRYPT);
}

export async function createAccount(username: string, password: string): Promise<SessionUser> {
  const id = accountId(username);
  const salt = randomBytes(16);
  const hash = await hashPassword(password, salt);
  const doc: AccountDoc = { v: 1, id, username, salt: b64url(salt), hash: b64url(hash), createdAt: Date.now() };
  try {
    await writeDoc(`accounts/${id}`, doc, { createOnly: true });
  } catch (e) {
    if (e instanceof ConflictError) throw new HttpError(409, "That username is taken. Try another, or sign in.");
    throw e;
  }
  return { id, username };
}

export async function verifyAccount(username: string, password: string): Promise<SessionUser> {
  const doc = await readDoc<AccountDoc>(`accounts/${accountId(username)}`);
  // Hash even when the account is missing so response timing does not reveal which usernames exist.
  const salt = doc ? Buffer.from(doc.salt, "base64url") : randomBytes(16);
  const hash = await hashPassword(password, salt);
  const expected = doc ? Buffer.from(doc.hash, "base64url") : randomBytes(64);
  if (!doc || expected.length !== hash.length || !timingSafeEqual(expected, hash)) throw new HttpError(401, "That username and password don’t match.");
  return { id: doc.id, username: doc.username };
}

/* ---------------- session cookie ---------------- */

export function sessionToken(user: SessionUser, now = Date.now()) {
  const payload = b64url(Buffer.from(JSON.stringify({ i: user.id, u: user.username, e: now + SESSION_DAYS * 86_400_000 })));
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined | null, now = Date.now()): SessionUser | null {
  if (!token || token.length > 600) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  let expected: string;
  try { expected = sign(payload); } catch { return null; }
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { i?: unknown; u?: unknown; e?: unknown };
    if (typeof d.i !== "string" || typeof d.u !== "string" || typeof d.e !== "number" || d.e < now) return null;
    return { id: d.i, username: d.u };
  } catch { return null; }
}

/** Set-Cookie header value for a signed session (or an expired one when token is empty). */
export function sessionSetCookie(token: string) {
  const maxAge = token ? SESSION_DAYS * 86_400 : 0;
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

/** Current user from the request cookie (server components and route handlers). */
export async function currentUser(): Promise<SessionUser | null> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function requireUser(): Promise<SessionUser> {
  const u = await currentUser();
  if (!u) throw new HttpError(401, "Please sign in again.");
  return u;
}
