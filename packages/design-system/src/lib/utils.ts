import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Class names tailwind-preset.js adds. tailwind-merge doesn't read the Tailwind config, so
 * without these it takes `text-body` for a colour and drops it next to `text-foreground`.
 * utils.test.ts checks these lists against the preset.
 */
export const pennyClassNames = {
  fontSize: [
    "figure-xl",
    "figure-lg",
    "figure-md",
    "title",
    "heading",
    "field",
    "headline",
    "body-lg",
    "body",
    "label",
    "caption",
    "small",
    "micro",
  ],
  fontFamily: ["sans-medium", "sans-semibold", "sans-bold", "display", "display-bold"],
  borderWidth: ["hairline", "1.5", "2.5", "3"],
  spacing: ["gutter", "touch"],
};

const borderSides = ["", "-x", "-y", "-t", "-r", "-b", "-l"] as const;

const twMerge = extendTailwindMerge({
  extend: {
    theme: { spacing: pennyClassNames.spacing },
    classGroups: {
      "font-size": [{ text: pennyClassNames.fontSize }],
      "font-family": [{ font: pennyClassNames.fontFamily }],
      ...Object.fromEntries(
        borderSides.map((side) => [
          `border-w${side}`,
          [{ [`border${side}`]: pennyClassNames.borderWidth }],
        ]),
      ),
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
