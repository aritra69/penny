import * as React from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";
import { Text } from "./text";

type WordmarkProps = {
  /** Letter height in dp. The splash uses 52. */
  size?: number;
  /** "dark" on a black screen. */
  tone?: "light" | "dark";
  className?: string;
};

/** Penny's name set in the display face, closed with a square full stop. */
export function Wordmark({ size = 52, tone = "light", className }: WordmarkProps) {
  const dot = Math.round(size * 0.21);
  return (
    <View role="img" aria-label="Penny" className={cn("flex-row items-baseline", className)}>
      <Text
        aria-hidden
        className={cn("font-display", tone === "dark" && "text-primary-foreground")}
        style={{ fontSize: size, lineHeight: Math.round(size * 1.15), letterSpacing: -size / 26 }}
      >
        penny
      </Text>
      <View
        aria-hidden
        className={tone === "dark" ? "bg-background" : "bg-foreground"}
        style={{ width: dot, height: dot, marginLeft: 2 }}
      />
    </View>
  );
}
