import "server-only";

export const env = {
  key: process.env.OPENROUTER_API_KEY?.trim() || "",
  // The guide needs nuance, restraint and a light touch; same default Ratico uses for coaching.
  guideModel: process.env.OPENROUTER_GUIDE_MODEL?.trim() || "anthropic/claude-sonnet-5.5",
  guideFallbackModel: process.env.OPENROUTER_GUIDE_FALLBACK_MODEL?.trim() || "google/gemini-3.8-flash",
  appMode: (process.env.APP_MODE?.trim() || "live") as "live" | "demo",
  appOrigin: process.env.APP_ORIGIN?.trim() || "",
  ratePerMinute: Number(process.env.KOAN_RATE_PER_MINUTE) || 12,
  globalPerHour: Number(process.env.KOAN_GLOBAL_PER_HOUR) || 600,
};

export const liveReady = () => env.appMode === "live" && !!env.key;
