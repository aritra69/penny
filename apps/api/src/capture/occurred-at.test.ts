import { describe, expect, test } from "bun:test";
import { resolveOccurredAt } from "./occurred-at.ts";

// 18 Nov 2026, 09:30:20 IST.
const received = "2026-11-18T04:00:20.000Z";

describe("resolveOccurredAt", () => {
  test("reads a stated date and time as IST", () => {
    expect(resolveOccurredAt("2026-11-17", "21:14", received)).toBe("2026-11-17T15:44:00.000Z");
  });

  test("uses the arrival time for a date-only message that arrived that day", () => {
    expect(resolveOccurredAt("2026-11-18", null, received)).toBe(received);
  });

  test("uses noon IST for a date-only message about another day", () => {
    expect(resolveOccurredAt("2026-11-15", null, received)).toBe("2026-11-15T06:30:00.000Z");
  });

  test("falls back to the arrival time", () => {
    expect(resolveOccurredAt(null, null, received)).toBe(received);
    expect(resolveOccurredAt("18 Nov", "9:30 pm", received)).toBe(received);
  });

  test("ignores a time that isn't a time", () => {
    expect(resolveOccurredAt("2026-11-18", "25:99", received)).toBe(received);
  });
});
