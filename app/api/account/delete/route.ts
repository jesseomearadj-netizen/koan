import { checkOrigin, errorResponse, json, limitIp, readJson } from "@/lib/server/guard";
import { checkPassword, deleteAccount, requireUser, sessionSetCookie } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const user = await requireUser();
    limitIp(req, "delete", 5);
    const body = await readJson<{ password?: unknown }>(req, 4_000);
    await deleteAccount(user.username, checkPassword(body.password));
    return json({ ok: true }, 200, { "Set-Cookie": sessionSetCookie("") });
  } catch (e) {
    return errorResponse(e);
  }
}
