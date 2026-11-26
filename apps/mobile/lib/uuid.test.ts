import { describe, expect, it } from "vitest";

import { randomUUID } from "@/lib/uuid";

describe("randomUUID", () => {
  it("returns a version 4 UUID", () => {
    expect(randomUUID()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("doesn't repeat", () => {
    const ids = new Set(Array.from({ length: 1000 }, randomUUID));
    expect(ids.size).toBe(1000);
  });
});
