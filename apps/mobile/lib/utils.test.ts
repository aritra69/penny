import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names and drops falsy values", () => {
    expect(cn("px-4", false && "hidden", undefined, null, "py-2")).toBe("px-4 py-2");
  });

  it("supports conditional object syntax", () => {
    expect(cn("text-sm", { "font-bold": true, italic: false })).toBe("text-sm font-bold");
  });

  it("lets later Tailwind classes override conflicting earlier ones", () => {
    expect(cn("bg-primary px-2", "px-4")).toBe("bg-primary px-4");
    expect(cn("text-foreground", "text-muted-foreground")).toBe("text-muted-foreground");
  });
});
