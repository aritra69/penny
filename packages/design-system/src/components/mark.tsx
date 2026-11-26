import * as React from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";
import { Text } from "./text";

type MarkProps = {
  children: string;
  /** "sm" for a tag beside a title ("Free trial"), "default" for a line on its own. */
  size?: "default" | "sm";
  className?: string;
};

/**
 * A short label on highlighter, for _now_: "Free trial", "2 days left in your free month".
 * Ink on the accent, square, one per screen.
 */
export function Mark({ children, size = "default", className }: MarkProps) {
  return (
    <View
      className={cn(
        "self-start bg-highlight",
        size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1",
        className,
      )}
    >
      <Text className={cn("font-sans-bold", size === "sm" ? "text-small" : "text-caption")}>
        {children}
      </Text>
    </View>
  );
}
