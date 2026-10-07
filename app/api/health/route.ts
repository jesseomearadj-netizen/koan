import { liveReady } from "@/lib/server/env";
import { json } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  return json({ ok: true, live: liveReady(), storage: process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local", time: new Date().toISOString() });
}
