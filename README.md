# koan. — a light guide back to your own experience

A mindful friend with an old teacher's eyes. Koan keeps things light and keeps pointing you back to what's actually here: it asks the question instead of handing you the answer, quietly tracks the stories you keep telling, and invites small experiments with stillness and nature. It draws on Eckhart Tolle, Krishnamurti, Osho, Bashar, Neville Goddard, Reality Transurfing, Peter Crone, Joe Dispenza and neuroscience, as lenses held lightly, never as authorities.

Same stack as Ratico: Next.js (App Router, TypeScript) · OpenRouter · private Vercel Blob for accounts and journals · Vercel hosting · installable PWA.

## What's in it

- **Talk** — chat with the guide (`lib/server/guide.ts`). Replies are short, playful and inquiry-led, with an optional question to sit with and an optional experiment. Schema-constrained output, validated server-side. Default model `anthropic/claude-sonnet-5.5`, falling back to `google/gemini-3.8-flash` if the provider fails.
- **Path** — twelve playful quests inward (`lib/wisdom.ts`), each with a wisdom card, a small mission and a question answered in your own words; plus a deck of 30 wisdom cards. Direct quotes only come from sourced public-domain texts; everything else is a reframe "in the spirit of" a teacher, and the guide can only cite cards by id.
- **Stories** — narratives the guide notices in your words ("I'm not good enough"), merged across wordings, with where they showed up and a status: Noticed → Questioned → Seen through. You can add your own.
- **Stillness** — a sit timer with a soft chime, twelve experiments across stillness, nature and inquiry (`lib/practices.ts`), a short note after each sit, and a streak.
- **Accounts** — the same deliberately simple username + password accounts as Ratico (scrypt hashes, HMAC-signed HttpOnly cookie, no email or reset yet). From the name menu people can download everything Koan keeps about them as JSON, or permanently delete their account after re-entering their password.
- **Care first** — crisis language is caught before the model and always answered with plain warmth and crisis-line numbers; the model is told to do the same and never to use spiritual ideas to dismiss real pain. Koan is not therapy.
- **Demo mode** — without `OPENROUTER_API_KEY` the guide answers with scripted inquiry questions, so the app runs with no credentials.

## Run locally

```bash
cp .env.example .env.local   # fill in OPENROUTER_API_KEY to get the live guide
npm install
npm run dev                  # http://localhost:3000
npm test                     # journal, guide and account tests
```

Without `BLOB_READ_WRITE_TOKEN`, local development stores accounts and journals in `./.data`.

## Deploy (Vercel)

1. Import this repo in Vercel (framework: Next.js, root directory: repo root).
2. Storage → create a **private Blob** store and connect it to the project (adds `BLOB_READ_WRITE_TOKEN`).
3. Add `AUTH_SECRET` (32+ random characters, e.g. `openssl rand -base64 48`) and `OPENROUTER_API_KEY`, for Production and Preview. Production refuses sign-in without `AUTH_SECRET`.
4. Optional: set `APP_ORIGIN` to the production URL (used for share-card links), and a credit limit on the OpenRouter key.
5. Redeploy, then check `/api/health` shows `"live": true, "storage": "blob"`, sign up, send a message, finish a quest, log a sit, download the journal and delete the test account.

CI (`.github/workflows/ci.yml`) runs tests, a type check and a production build on every push and pull request.

## Environment

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | Server-only key. Never use a `NEXT_PUBLIC_` prefix. |
| `OPENROUTER_GUIDE_MODEL` / `_FALLBACK_MODEL` | The guide's voice. Defaults `anthropic/claude-sonnet-5.5` / `google/gemini-3.8-flash`. |
| `AUTH_SECRET` | Signs session cookies (32+ chars). Rotating it signs everyone out; accounts are kept. |
| `BLOB_READ_WRITE_TOKEN` | Private Vercel Blob store. Keys are namespaced `prod/`, `preview/`, `dev/`. |
| `APP_MODE` | `live` (default) or `demo`. |
| `APP_ORIGIN` | Optional extra allowed origin. |
| `KOAN_RATE_PER_MINUTE`, `KOAN_GLOBAL_PER_HOUR` | Per-IP and app-wide guide limits (per instance for now). |

## Honest limits

Rate limits are per serverless instance (Ratico shares them through Supabase; Koan doesn't have a database yet). Accounts have no reset. Journals are stored privately but are sent to the AI provider as context for replies. Set a credit limit on the OpenRouter key.
