import { describe, expect, it, vi } from "vitest";

import { checkOpenAIKey, formatLatency, looksLikeOpenAIKey, pickModel } from "@/lib/openai";

const KEY = "sk-test-0000000000000000000000";

const respond = (status: number, body: unknown = {}) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

/** A clock that advances by `ms` between the two reads the check makes. */
const clock = (ms: number) => {
  let t = 1000;
  return () => {
    const value = t;
    t += ms;
    return value;
  };
};

describe("looksLikeOpenAIKey", () => {
  it("accepts keys that start with sk-", () => {
    expect(looksLikeOpenAIKey(KEY)).toBe(true);
    expect(looksLikeOpenAIKey(`  ${KEY}\n`)).toBe(true);
    expect(looksLikeOpenAIKey("sk-proj-abcdefghijklmnopqrstuvwxyz")).toBe(true);
  });

  it("rejects empty, short or other text", () => {
    expect(looksLikeOpenAIKey("")).toBe(false);
    expect(looksLikeOpenAIKey("sk-short")).toBe(false);
    expect(looksLikeOpenAIKey("my key is sk-test-0000000000000000000000")).toBe(false);
    expect(looksLikeOpenAIKey("sk-test 0000000000000000000000")).toBe(false);
  });
});

describe("pickModel", () => {
  const models = [
    { id: "gpt-a", created: 10 },
    { id: "gpt-a-mini", created: 11 },
    { id: "gpt-b", created: 30 },
    { id: "gpt-b-mini", created: 31 },
    { id: "gpt-b-mini-tts", created: 40 },
    { id: "gpt-b-realtime", created: 41 },
    { id: "text-embedding-3", created: 50 },
  ];

  it("picks the newest small GPT model", () => {
    expect(pickModel(models)).toBe("gpt-b-mini");
  });

  it("falls back to the newest GPT model", () => {
    expect(pickModel(models.filter((m) => !m.id.includes("mini")))).toBe("gpt-b");
  });

  it("uses the preferred model when the key has it", () => {
    expect(pickModel(models, "gpt-a")).toBe("gpt-a");
    expect(pickModel(models, "gpt-missing")).toBe("gpt-b-mini");
  });

  it("returns null when nothing can sort text", () => {
    expect(pickModel([{ id: "text-embedding-3" }, { id: "gpt-b-realtime" }])).toBeNull();
  });
});

describe("formatLatency", () => {
  it("shows one decimal under ten seconds", () => {
    expect(formatLatency(812)).toBe("0.8 s");
    expect(formatLatency(1249)).toBe("1.2 s");
    expect(formatLatency(12400)).toBe("12 s");
  });
});

describe("checkOpenAIKey", () => {
  it("reports the model and how long the call took", async () => {
    const fetchMock = respond(200, { data: [{ id: "gpt-b-mini", created: 2 }] });
    const result = await checkOpenAIKey(` ${KEY} `, { fetch: fetchMock, now: clock(800) });
    expect(result).toEqual({ ok: true, model: "gpt-b-mini", latencyMs: 800 });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/models",
      expect.objectContaining({ headers: { Authorization: `Bearer ${KEY}` } }),
    );
  });

  it("says when OpenAI rejects the key, without repeating it", async () => {
    const result = await checkOpenAIKey(KEY, { fetch: respond(401) });
    expect(result).toMatchObject({ ok: false, reason: "invalid" });
    expect(JSON.stringify(result)).not.toContain(KEY);
  });

  it("separates an OpenAI outage from a bad key", async () => {
    expect(await checkOpenAIKey(KEY, { fetch: respond(500) })).toMatchObject({
      ok: false,
      reason: "unavailable",
    });
    expect(await checkOpenAIKey(KEY, { fetch: respond(429) })).toMatchObject({
      ok: false,
      reason: "unavailable",
    });
  });

  it("says when the key has no usable model", async () => {
    const result = await checkOpenAIKey(KEY, { fetch: respond(200, { data: [] }) });
    expect(result).toMatchObject({ ok: false, reason: "no-model" });
  });

  it("reports a network failure", async () => {
    const failing = vi.fn(async () => {
      throw new TypeError("Network request failed");
    }) as unknown as typeof fetch;
    const result = await checkOpenAIKey(KEY, { fetch: failing });
    expect(result).toMatchObject({ ok: false, reason: "network" });
  });
});
