import { cn } from "../lib/utils";
import { Slot } from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Platform, Text as RNText, type Role } from "react-native";

/**
 * Penny's type styles. All text is ink: hierarchy comes from size, weight and the display face,
 * never from grey. Figures (money) use the display face; everything else is Inter.
 */
const textVariants = cva(
  cn("font-sans text-body text-foreground", Platform.select({ web: "select-text" })),
  {
    variants: {
      variant: {
        default: "",
        // Money and big numbers
        "figure-xl": "font-display text-figure-xl",
        "figure-lg": "font-display text-figure-lg",
        "figure-md": "font-display text-figure-md",
        figure: "font-display text-heading",
        // Headings
        title: "font-display text-title",
        heading: "font-display text-heading",
        headline: "font-sans-bold text-headline",
        // Running text
        "body-lg": "text-body-lg",
        body: "text-body",
        strong: "font-sans-semibold text-body",
        label: "font-sans-bold text-label",
        caption: "text-caption",
        "caption-strong": "font-sans-semibold text-caption",
        small: "text-small",
        micro: "text-micro",
        // Names kept for Reusables components and existing screens
        h1: "font-display text-title",
        h2: "font-display text-heading",
        h3: "font-display text-title",
        h4: "font-sans-bold text-headline",
        p: "text-body",
        lead: "text-body-lg",
        large: "font-sans-semibold text-body-lg",
        muted: "text-caption",
        code: "font-mono text-caption",
        blockquote: "border-l-1.5 border-foreground pl-3 text-body",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps["variant"]>;

const HEADINGS: Partial<Record<TextVariant, string>> = {
  title: "1",
  h1: "1",
  heading: "2",
  h2: "2",
  h3: "2",
  headline: "3",
  h4: "3",
};

const ROLE: Partial<Record<TextVariant, Role>> = {
  blockquote: Platform.select({ web: "blockquote" as Role }),
  code: Platform.select({ web: "code" as Role }),
};

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  variant = "default",
  ...props
}: React.ComponentProps<typeof RNText> &
  React.RefAttributes<typeof RNText> &
  TextVariantProps & {
    asChild?: boolean;
  }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot : RNText;
  const level = variant ? HEADINGS[variant] : undefined;
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={level ? "heading" : variant ? ROLE[variant] : undefined}
      aria-level={level}
      {...props}
    />
  );
}

export { Text, TextClassContext, textVariants };
export type { TextVariant };
