import "server-only";
import { createHash } from "node:crypto";
import { env } from "./env";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });

export function errorResponse(e: unknown) {
  if (e instanceof HttpError) return json({ error: e.message }, e.status);
  console.error("[koan]", e instanceof Error ? e.message : e);
  return json({ error: "Something went wrong on the server. Your words are still here—try again." }, 500);
}

/** Same-origin check. Not authentication—just keeps casual cross-site use out. */
export function checkOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) {
    const site = req.headers.get("sec-fetch-site");
    if (site && site !== "same-origin" && site !== "none") throw new HttpError(403, "Cross-site requests are not allowed.");
    return;
  }
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  let ok = false;
  try { ok = new URL(origin).host === host; } catch { ok = false; }
  if (!ok && env.appOrigin && origin === env.appOrigin) ok = true;
  if (!ok) throw new HttpError(403, "This request came from an unexpected origin.");
}

export function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "local").trim();
}

const ipHash = (ip: string) => createHash("sha256").update(`koan:${ip}`).digest("hex").slice(0, 24);

// Per-instance buckets. Swap for a shared store (Supabase, as in Ratico) before a wide launch.
const memBuckets = new Map<string, number[]>();
function memHit(bucket: string, windowMs: number, limit: number) {
  const now = Date.now();
  const arr = (memBuckets.get(bucket) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) { memBuckets.set(bucket, arr); return false; }
  arr.push(now);
  memBuckets.set(bucket, arr);
  if (memBuckets.size > 5000) memBuckets.clear();
  return true;
}

/** Per-IP and app-wide AI call limits. */
export function rateLimit(req: Request, route: string) {
  if (!memHit(`ip:${ipHash(clientIp(req))}:${route}`, 60_000, env.ratePerMinute)) throw new HttpError(429, "Slow down a little. Take a breath, then try again.");
  if (!memHit("global", 3_600_000, env.globalPerHour)) throw new HttpError(429, "Koan has reached its hourly budget. Your journal is safe—try again later.");
}

/** Per-IP limit for cheap non-AI routes (sign-in, journal). */
export function limitIp(req: Request, route: string, perMinute: number) {
  if (!memHit(`${route}:${ipHash(clientIp(req))}`, 60_000, perMinute)) throw new HttpError(429, "Too many attempts. Wait a minute, then try again.");
}

export async function readJson<T>(req: Request, maxBytes: number): Promise<T> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > maxBytes) throw new HttpError(413, "That request is too large.");
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "That request is too large.");
  try { return JSON.parse(text) as T; } catch { throw new HttpError(400, "Invalid request body."); }
}
