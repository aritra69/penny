import * as React from "react";
import { Pressable, View } from "react-native";

import { cn } from "../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

type KeyValueRowProps = {
  /** "Category", "When", "From". */
  label: string;
  /** "Food & dining", "Sun 15 Nov, 1:20 pm". */
  value: string;
  /** Opens a picker to change the value; adds a chevron. */
  onPress?: () => void;
  className?: string;
};

/** A labelled field inside a card: label on the left, value on the right, rule above. */
export function KeyValueRow({ label, value, onPress, className }: KeyValueRowProps) {
  return (
    <Pressable
      role={onPress ? "button" : undefined}
      aria-label={`${label}: ${value}`}
      disabled={!onPress}
      onPress={onPress}
      className={cn(
        "min-h-12 flex-row items-center justify-between gap-3 border-t border-foreground active:bg-muted",
        className,
      )}
    >
      <Text variant="caption">{label}</Text>
      <View className="min-w-0 flex-row items-center gap-1.5">
        <Text variant="strong" numberOfLines={1}>
          {value}
        </Text>
        {onPress ? <Icon name="chevron-right" size={16} /> : null}
      </View>
    </Pressable>
  );
}

type SplitStatProps = {
  /** Two figures side by side: [{ label: "Each month", value: "≈ ₹8,600" }, { label: "For", value: "7 months" }]. */
  items: [{ label: string; value: string }, { label: string; value: string }];
  className?: string;
};

/** Two related figures between rules, split by a vertical rule. */
export function SplitStat({ items, className }: SplitStatProps) {
  return (
    <View className={cn("flex-row border-y border-foreground", className)}>
      {items.map((item, i) => (
        <View
          key={item.label}
          className={cn("flex-1 gap-0.5 py-3", i === 0 ? "border-r border-foreground" : "pl-3.5")}
        >
          <Text variant="small">{item.label}</Text>
          <Text className="font-sans-bold text-body-lg">{item.value}</Text>
        </View>
      ))}
    </View>
  );
}
