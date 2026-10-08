import { checkOrigin, errorResponse, HttpError, json, limitIp, readJson } from "@/lib/server/guard";
import { checkPassword, createAccount, normalizeUsername, sessionSetCookie, sessionToken } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    checkOrigin(req);
    limitIp(req, "signup", 5);
    const body = await readJson<{ username?: unknown; password?: unknown; over13?: unknown }>(req, 4_000);
    if (body.over13 !== true) throw new HttpError(400, "Koan accounts are for people 13 and older.");
    const user = await createAccount(normalizeUsername(body.username), checkPassword(body.password));
    return json({ user: { username: user.username } }, 201, { "Set-Cookie": sessionSetCookie(sessionToken(user)) });
  } catch (e) {
    return errorResponse(e);
  }
}
