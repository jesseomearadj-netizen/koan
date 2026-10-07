import { checkOrigin, errorResponse, HttpError, json, rateLimit, readJson } from "@/lib/server/guard";
import { requireUser } from "@/lib/server/auth";
import { guideTurn } from "@/lib/server/guide";
import { loadJournal, saveJournal } from "@/lib/server/journal";
import { applyTurn, LIMITS } from "@/lib/journal";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const user = await requireUser();
    rateLimit(req, "guide");
    const body = await readJson<{ text?: unknown }>(req, 8_000);
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) throw new HttpError(400, "Say something first, even just how you are.");
    if (text.length > LIMITS.text) throw new HttpError(400, "That's a lot at once. Try the heart of it in fewer words.");
    const journal = await loadJournal(user.id);
    const { turn, live } = await guideTurn(text, journal, req);
    const next = applyTurn(journal, text, turn);
    await saveJournal(user.id, next);
    return json({ turn, live, journal: next });
  } catch (e) {
    return errorResponse(e);
  }
}
