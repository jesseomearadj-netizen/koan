import { checkOrigin, errorResponse, json, limitIp, readJson } from "@/lib/server/guard";
import { checkPassword, createAccount, normalizeUsername, sessionSetCookie, sessionToken } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    checkOrigin(req);
    limitIp(req, "signup", 5);
    const body = await readJson<{ username?: unknown; password?: unknown }>(req, 4_000);
    const user = await createAccount(normalizeUsername(body.username), checkPassword(body.password));
    return json({ user: { username: user.username } }, 201, { "Set-Cookie": sessionSetCookie(sessionToken(user)) });
  } catch (e) {
    return errorResponse(e);
  }
}
