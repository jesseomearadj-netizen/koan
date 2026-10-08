import { errorResponse } from "@/lib/server/guard";
import { requireUser } from "@/lib/server/auth";
import { loadJournal } from "@/lib/server/journal";

export const runtime = "nodejs";

/** Everything Koan keeps about you, as a JSON download. */
export async function GET() {
  try {
    const user = await requireUser();
    const journal = await loadJournal(user.id);
    return new Response(JSON.stringify({ username: user.username, exportedAt: new Date().toISOString(), journal }, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="koan-${user.username}.json"`, "Cache-Control": "no-store" },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
