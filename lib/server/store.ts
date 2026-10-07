import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";

/**
 * Tiny JSON document store. Private Vercel Blob in deployments (BLOB_READ_WRITE_TOKEN),
 * a gitignored folder on disk for local development without a token.
 * Keys are namespaced per environment so local testing never touches production records.
 */

const NAMESPACE = process.env.VERCEL_ENV === "production" ? "prod" : process.env.VERCEL_ENV === "preview" ? "preview" : "dev";
const blobReady = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_DIR = path.join(process.cwd(), ".data");

export class ConflictError extends Error {}

function key(k: string) {
  if (!/^[a-z0-9/_-]{1,160}$/.test(k)) throw new Error("invalid store key");
  return `${NAMESPACE}/${k}.json`;
}

export async function readDoc<T>(k: string): Promise<T | null> {
  const p = key(k);
  if (blobReady()) {
    const r = await get(p, { access: "private", useCache: false });
    if (!r || r.statusCode !== 200 || !r.stream) return null;
    const text = await new Response(r.stream).text();
    return JSON.parse(text) as T;
  }
  try {
    return JSON.parse(await fs.readFile(path.join(LOCAL_DIR, p), "utf8")) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

/** Writes a document. With `createOnly`, fails with ConflictError if it already exists. */
export async function writeDoc(k: string, value: unknown, opts: { createOnly?: boolean } = {}) {
  const p = key(k);
  const body = JSON.stringify(value);
  if (blobReady()) {
    try {
      await put(p, body, { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: !opts.createOnly, cacheControlMaxAge: 60 });
    } catch (e) {
      if (opts.createOnly && (e instanceof BlobPreconditionFailedError || /already exists/i.test((e as Error).message))) throw new ConflictError("exists");
      throw e;
    }
    return;
  }
  const file = path.join(LOCAL_DIR, p);
  await fs.mkdir(path.dirname(file), { recursive: true });
  if (opts.createOnly) {
    try { await fs.writeFile(file, body, { flag: "wx" }); } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "EEXIST") throw new ConflictError("exists");
      throw e;
    }
    return;
  }
  await fs.writeFile(file, body);
}
