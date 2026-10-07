import { checkOrigin, errorResponse, json } from "@/lib/server/guard";
import { sessionSetCookie } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    checkOrigin(req);
    return json({ ok: true }, 200, { "Set-Cookie": sessionSetCookie("") });
  } catch (e) {
    return errorResponse(e);
  }
}
