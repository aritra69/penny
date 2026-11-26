import { describe, expect, it } from "vitest";

import { cn, pennyClassNames } from "./utils";

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

describe("cn with Penny's preset", () => {
  it("keeps a type size next to a text colour", () => {
    expect(cn("text-body text-foreground")).toBe("text-body text-foreground");
    expect(cn("text-caption", "text-primary-foreground")).toBe(
      "text-caption text-primary-foreground",
    );
  });

  it("lets a later type size replace an earlier one", () => {
    expect(cn("text-body", "text-body-lg")).toBe("text-body-lg");
    expect(cn("text-body", "text-sm")).toBe("text-sm");
  });

  it("treats Penny's font families as families, not weights", () => {
    expect(cn("font-sans", "font-display")).toBe("font-display");
    expect(cn("font-sans-bold font-bold")).toBe("font-sans-bold font-bold");
  });

  it("merges Penny's border widths and keeps border colours", () => {
    expect(cn("border-1.5 border-foreground", "border-2.5")).toBe("border-foreground border-2.5");
    expect(cn("border-b-1.5", "border-b-2.5")).toBe("border-b-2.5");
  });

  it("knows the gutter and touch spacing", () => {
    expect(cn("px-5", "px-gutter")).toBe("px-gutter");
    expect(cn("h-10", "h-touch")).toBe("h-touch");
  });

  it("matches the class names tailwind-preset.js defines", () => {
    const preset = require("../../tailwind-preset.js");
    const { fontFamily, fontSize, borderWidth, spacing } = preset.theme.extend;
    expect(pennyClassNames.fontSize).toEqual(Object.keys(fontSize));
    expect(pennyClassNames.fontFamily).toEqual(Object.keys(fontFamily).filter((f) => f !== "sans"));
    expect(pennyClassNames.borderWidth.sort()).toEqual(Object.keys(borderWidth).sort());
    expect(pennyClassNames.spacing).toEqual(Object.keys(spacing));
  });
});
