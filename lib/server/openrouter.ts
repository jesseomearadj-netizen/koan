import "server-only";
import { env } from "./env";
import { HttpError } from "./guard";

const API = (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");

function headers(req?: Request) {
  const origin = req ? new URL(req.url).origin : "https://koan.vercel.app";
  return {
    Authorization: `Bearer ${env.key}`,
    "Content-Type": "application/json",
    "HTTP-Referer": origin,
    "X-Title": "Koan",
  };
}

async function providerError(res: Response): Promise<HttpError> {
  const body = await res.text().catch(() => "");
  console.error(`[openrouter] ${res.status} ${body.slice(0, 400)}`);
  if (res.status === 401) return new HttpError(502, "The AI provider rejected the server key. Check OPENROUTER_API_KEY.");
  if (res.status === 402) return new HttpError(502, "The AI account is out of credits. Your journal is safe.");
  if (res.status === 429) return new HttpError(429, "The AI provider is busy. Try again in a moment.");
  return new HttpError(502, "The guide could not answer just now. Your words are still here—try again.");
}

export interface ChatMessage { role: "system" | "user" | "assistant"; content: string }

/** Schema-constrained chat completion. Returns parsed JSON (still untrusted—validate after). */
export async function chatJSON(opts: { name: string; schema: object; messages: ChatMessage[]; maxTokens?: number; req?: Request; temperature?: number; model: string; timeoutMs?: number }): Promise<unknown> {
  const body = (strict: boolean) => ({
    model: opts.model,
    messages: opts.messages,
    ...(strict
      ? { response_format: { type: "json_schema", json_schema: { name: opts.name, strict: true, schema: opts.schema } }, provider: { require_parameters: true } }
      : { response_format: { type: "json_object" } }),
    max_tokens: opts.maxTokens ?? 1200,
    temperature: opts.temperature ?? 0.7,
    stream: false,
  });
  const send = (strict: boolean) => fetch(`${API}/chat/completions`, { method: "POST", headers: headers(opts.req), body: JSON.stringify(body(strict)), signal: AbortSignal.timeout(opts.timeoutMs ?? 45000) });
  let res = await send(true);
  if (res.status === 400 || res.status === 404) {
    // Model/provider may not support strict structured outputs; fall back to JSON mode + our own validation.
    const detail = await res.text().catch(() => "");
    console.warn("[openrouter] strict schema rejected, retrying json_object:", detail.slice(0, 200));
    res = await send(false);
  }
  if (!res.ok) throw await providerError(res);
  const data = (await res.json()) as { choices?: { message?: { content?: string; refusal?: string } }[] };
  const msg = data.choices?.[0]?.message;
  if (msg?.refusal) throw new HttpError(422, "The guide could not respond to that. Try putting it another way.");
  const content = (msg?.content || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try { return JSON.parse(content); } catch { throw new HttpError(502, "The guide sent an unreadable answer. Try again."); }
}

/** chatJSON across models in order: the next model is tried only when the provider fails (never on 429). */
export async function chatJSONModels(models: string[], opts: Omit<Parameters<typeof chatJSON>[0], "model">): Promise<unknown> {
  const list = models.filter((m, i, a) => m && a.indexOf(m) === i);
  let last: unknown = null;
  for (const model of list) {
    try { return await chatJSON({ ...opts, model }); } catch (e) {
      last = e;
      if (e instanceof HttpError && e.status === 429) throw e;
    }
  }
  throw last ?? new HttpError(502, "The guide could not answer just now.");
}
