import * as React from "react";

import { formatMoney, formatMoneyCompact, type SignDisplay } from "../lib/money";
import { cn } from "../lib/utils";
import { Text, type TextVariant } from "./text";

const HiddenAmountsContext = React.createContext(false);

/**
 * Wrap the app (or a screen) to hide every <Amount>, for the eye button in the Home header.
 * Hidden amounts keep their sign and currency so the screen still makes sense.
 */
export function HiddenAmountsProvider({
  hidden,
  children,
}: {
  hidden: boolean;
  children: React.ReactNode;
}) {
  return <HiddenAmountsContext.Provider value={hidden}>{children}</HiddenAmountsContext.Provider>;
}

export function useAmountsHidden() {
  return React.useContext(HiddenAmountsContext);
}

type AmountProps = Omit<React.ComponentProps<typeof Text>, "children" | "variant"> & {
  /** Integer minor units; negative = money out. */
  minor: number;
  currency: string;
  sign?: SignDisplay;
  /** "₹3L" instead of "₹3,00,000", for tight boxes. */
  compact?: boolean;
  variant?: TextVariant;
};

/** A formatted money value. Use it for every amount on screen so hiding and signs stay consistent. */
export function Amount({
  minor,
  currency,
  sign = "auto",
  compact,
  variant = "strong",
  className,
  ...props
}: AmountProps) {
  const hidden = useAmountsHidden();
  const text = compact
    ? formatMoneyCompact(minor, currency, { sign })
    : formatMoney(minor, currency, { sign });
  const shown = hidden ? text.replace(/[\d.,]+/, "••••") : text;
  return (
    <Text
      variant={variant}
      aria-label={hidden ? "Amount hidden" : undefined}
      className={cn("tabular-nums", className)}
      {...props}
    >
      {shown}
    </Text>
  );
}
