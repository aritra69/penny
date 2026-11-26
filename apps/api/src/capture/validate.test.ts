import { describe, expect, test } from "bun:test";
import { validateCapture } from "./validate.ts";

describe("validateCapture", () => {
  test("accepts a message and normalises it", () => {
    expect(
      validateCapture({
        source: "notification",
        sender: " com.phonepe.app ",
        title: "  ",
        text: " ₹249 paid to Blue Tokai ",
        receivedAt: "2026-11-18T09:30:20+05:30",
      }),
    ).toEqual({
      ok: true,
      value: {
        source: "notification",
        sender: "com.phonepe.app",
        title: null,
        text: "₹249 paid to Blue Tokai",
        receivedAt: "2026-11-18T04:00:20.000Z",
      },
    });
  });

  test("rejects bad and unknown fields", () => {
    const result = validateCapture({
      source: "email",
      sender: "",
      text: 5,
      receivedAt: "soon",
      x: 1,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual([
      "unknown field: x",
      "source must be one of: sms, notification",
      "sender must be a non-empty string of at most 200 characters",
      "text must be a non-empty string",
      "receivedAt must be an ISO 8601 date-time string",
    ]);
  });

  test("rejects a message that is too long", () => {
    const result = validateCapture({
      source: "sms",
      sender: "AX-SBIINB",
      text: "a".repeat(2001),
      receivedAt: "2026-11-18T04:00:20Z",
    });
    expect(result.ok).toBe(false);
  });
});
