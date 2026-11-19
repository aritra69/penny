/**
 * Checking the user's OpenAI key. Plain TypeScript with `fetch` passed in, so it runs in tests.
 * The key is only ever sent to OpenAI, in the Authorization header. Never log it, and never put
 * it in an error message.
 */

const MODELS_URL = "https://api.openai.com/v1/models";
const TIMEOUT_MS = 15_000;

export type KeyCheckResult =
  | { ok: true; model: string; latencyMs: number }
  | { ok: false; reason: "invalid" | "no-model" | "unavailable" | "network"; message: string };

type ModelEntry = { id: string; created?: number };

/** Model families that can't sort a text message. */
const NOT_FOR_TEXT =
  /audio|realtime|image|tts|transcribe|whisper|embedding|moderation|search|instruct|codex/;

/** Good enough to be worth a network call: OpenAI keys start with "sk-". */
export function looksLikeOpenAIKey(key: string): boolean {
  const trimmed = key.trim();
  return /^sk-\S{17,}$/.test(trimmed);
}

/**
 * The model Penny would sort messages with, from the ones this key can use: the newest small
 * GPT model, or the newest GPT model if there is no small one. `preferred` wins when the key has it.
 */
export function pickModel(models: readonly ModelEntry[], preferred?: string): string | null {
  if (preferred && models.some((m) => m.id === preferred)) return preferred;
  const usable = models.filter((m) => m.id.startsWith("gpt-") && !NOT_FOR_TEXT.test(m.id));
  const newestFirst = [...usable].sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
  const small = newestFirst.find((m) => /mini|nano/.test(m.id));
  return (small ?? newestFirst[0])?.id ?? null;
}

/** "0.8 s", "1.2 s", "12 s". */
export function formatLatency(latencyMs: number): string {
  const seconds = latencyMs / 1000;
  return `${seconds >= 10 ? Math.round(seconds) : seconds.toFixed(1)} s`;
}

type CheckOptions = {
  fetch?: typeof fetch;
  now?: () => number;
  preferredModel?: string;
};

/**
 * One small authenticated request: list the models this key can use. It costs nothing, proves the
 * key works, and tells us which model to sort with.
 */
export async function checkOpenAIKey(
  key: string,
  options: CheckOptions = {},
): Promise<KeyCheckResult> {
  const doFetch = options.fetch ?? fetch;
  const now = options.now ?? Date.now;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = now();

  try {
    const response = await doFetch(MODELS_URL, {
      headers: { Authorization: `Bearer ${key.trim()}` },
      signal: controller.signal,
    });
    const latencyMs = now() - started;

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        reason: "invalid",
        message: "OpenAI didn't accept this key. Check it and paste it again.",
      };
    }
    if (!response.ok) {
      return {
        ok: false,
        reason: "unavailable",
        message: "OpenAI couldn't check the key right now. Try again in a minute.",
      };
    }

    const body: unknown = await response.json();
    const data =
      typeof body === "object" && body !== null && Array.isArray((body as { data?: unknown }).data)
        ? (body as { data: unknown[] }).data
        : [];
    const models = data.filter(
      (m): m is ModelEntry =>
        typeof m === "object" && m !== null && typeof (m as ModelEntry).id === "string",
    );
    const model = pickModel(models, options.preferredModel);
    if (!model) {
      return {
        ok: false,
        reason: "no-model",
        message: "This key works, but it can't use a GPT model. Check its permissions at OpenAI.",
      };
    }
    return { ok: true, model, latencyMs };
  } catch {
    return {
      ok: false,
      reason: "network",
      message: "Couldn't reach OpenAI. Check your connection and try again.",
    };
  } finally {
    clearTimeout(timer);
  }
}
