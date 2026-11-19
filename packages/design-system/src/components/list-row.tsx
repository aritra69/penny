import * as React from "react";
import { Pressable, View } from "react-native";

import { cn } from "../lib/utils";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

type ListRowProps = {
  /** "Swiggy", "HDFC → SBI · ₹10,000". */
  title: string;
  /** "Food · today", "Your own accounts, not counted". */
  subtitle?: string;
  /** Right-hand value, usually an <Amount />. */
  trailing?: React.ReactNode;
  /** A line icon before the text, for rows that stand for a place rather than a transaction. */
  leading?: IconName;
  /** Shows a chevron; set when the row opens something. */
  onPress?: () => void;
  /** Which rules to draw. Lists use "bottom"; the first row under a heading may use "both". */
  border?: "bottom" | "top" | "both" | "none";
  className?: string;
};

const BORDER = {
  bottom: "border-b border-foreground",
  top: "border-t border-foreground",
  both: "border-y border-foreground",
  none: "",
};

/** A flat row between 1px rules: no cards, no icons-in-circles. Transactions, settings, lists. */
export function ListRow({
  title,
  subtitle,
  trailing,
  leading,
  onPress,
  border = "bottom",
  className,
}: ListRowProps) {
  return (
    <Pressable
      role={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      className={cn(
        "min-h-[60px] flex-row items-center gap-3 py-2 active:bg-muted",
        BORDER[border],
        className,
      )}
    >
      {leading ? <Icon name={leading} size={24} /> : null}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="strong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      {trailing}
      {onPress ? <Icon name="chevron-right" size={18} /> : null}
    </Pressable>
  );
}
