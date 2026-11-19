import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Platform, TextInput } from "react-native";

import { colors } from "../lib/theme";
import { cn } from "../lib/utils";

/**
 * Penny's text input: no box, the value set large and bold on an ink underline.
 * "field" for words (email, goal name) · "amount" for money, in the display face.
 */
const inputVariants = cva(
  cn(
    "w-full min-w-0 border-b-2.5 border-foreground bg-transparent px-0 text-foreground",
    Platform.select({ web: "outline-none" }),
  ),
  {
    variants: {
      variant: {
        field: "pb-2 pt-1.5 font-sans-bold text-field",
        amount: "pb-1.5 font-display text-figure-lg",
      },
    },
    defaultVariants: { variant: "field" },
  },
);

type InputProps = React.ComponentProps<typeof TextInput> &
  VariantProps<typeof inputVariants> & {
    /** Draws the underline in the error colour. TextField sets it from `error`. */
    "aria-invalid"?: boolean;
  };

function Input({ className, variant, editable, ...props }: InputProps) {
  return (
    <TextInput
      editable={editable}
      placeholderTextColor={colors.mutedText}
      selectionColor={colors.ink}
      cursorColor={colors.ink}
      className={cn(
        inputVariants({ variant }),
        editable === false && "opacity-50",
        props["aria-invalid"] && "border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input, inputVariants };
export type { InputProps };
