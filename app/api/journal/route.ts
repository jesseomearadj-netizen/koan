import { checkOrigin, errorResponse, HttpError, json, limitIp, readJson } from "@/lib/server/guard";
import { requireUser } from "@/lib/server/auth";
import { loadJournal, saveJournal } from "@/lib/server/journal";
import { addSit, emptyJournal, noticeNarrative, removeNarrative, setNarrativeStatus } from "@/lib/journal";
import type { NarrativeStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    return json({ journal: await loadJournal(user.id) });
  } catch (e) {
    return errorResponse(e);
  }
}

type Action =
  | { action: "status"; id: string; status: NarrativeStatus }
  | { action: "remove"; id: string }
  | { action: "notice"; story: string; where?: string }
  | { action: "sit"; minutes: number; note?: string }
  | { action: "clear-conversation" };

export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const user = await requireUser();
    limitIp(req, "journal", 60);
    const a = await readJson<Action>(req, 4_000);
    let j = await loadJournal(user.id);
    switch (a.action) {
      case "status": j = setNarrativeStatus(j, String(a.id), a.status); break;
      case "remove": j = removeNarrative(j, String(a.id)); break;
      case "notice": j = noticeNarrative(j, String(a.story || ""), String(a.where || "")); break;
      case "sit": j = addSit(j, Number(a.minutes), String(a.note || "")); break;
      case "clear-conversation": j = { ...j, messages: emptyJournal().messages }; break;
      default: throw new HttpError(400, "Unknown action.");
    }
    await saveJournal(user.id, j);
    return json({ journal: j });
  } catch (e) {
    return errorResponse(e);
  }
}
