import * as React from "react";
import { Pressable, View } from "react-native";

import { formatMoney } from "../lib/money";
import { cn } from "../lib/utils";
import { useAmountsHidden } from "./amount";
import { ProgressBar } from "./progress-bar";
import { Text } from "./text";

type BudgetRowProps = {
  name: string;
  spentMinor: number;
  budgetMinor: number;
  currency: string;
  /** How far through the period today is, 0 to 1. Draws the "where you should be" tick. */
  pace?: number;
  /** The status line: "Ahead of pace · ₹1,760 left". Penny writes it; the row doesn't guess. */
  status: string;
  onPress?: () => void;
  className?: string;
};

/**
 * One budget: name and "spent / budget", a thin bar with today's pace tick, and a status line.
 * Over budget fills the bar and sets the status in bold — no red.
 */
export function BudgetRow({
  name,
  spentMinor,
  budgetMinor,
  currency,
  pace,
  status,
  onPress,
  className,
}: BudgetRowProps) {
  const hidden = useAmountsHidden();
  const over = spentMinor > budgetMinor;
  const ratio = budgetMinor > 0 ? spentMinor / budgetMinor : 0;
  const money = (minor: number) => (hidden ? "••••" : formatMoney(minor, currency));

  return (
    <Pressable
      role={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      className={cn("gap-2 border-b border-foreground pb-4 pt-3.5 active:bg-muted", className)}
    >
      <View className="flex-row items-baseline justify-between gap-3">
        <Text variant="strong" className="flex-1" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="label" className="font-sans tabular-nums">
          <Text className="font-sans-bold text-label">{money(spentMinor)}</Text> /{" "}
          {money(budgetMinor)}
        </Text>
      </View>
      <ProgressBar value={ratio} tick={pace} size="sm" label={`${name} budget`} />
      <Text variant={over ? "caption-strong" : "caption"}>{status}</Text>
    </Pressable>
  );
}
