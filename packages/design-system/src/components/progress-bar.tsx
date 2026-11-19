import * as React from "react";
import { View } from "react-native";

import { useMotion } from "../lib/motion";
import { cn } from "../lib/utils";
import { MotiView } from "./motion";

type ProgressBarProps = {
  /** 0 to 1. Values over 1 draw a full bar (an over-spent budget). */
  value: number;
  /** Where the user should be today, 0 to 1: a vertical tick across the bar. */
  tick?: number;
  /** "md": 12dp, 1.5 border (imports, goals) · "sm": 8dp, 1px border (budget rows). */
  size?: "md" | "sm";
  /** Read by screen readers: "Import progress", "Food & dining budget". */
  label: string;
  className?: string;
};

/** An outlined bar filled with ink. The fill grows to its value when it first appears. */
export function ProgressBar({ value, tick, size = "md", label, className }: ProgressBarProps) {
  const motion = useMotion();
  const [width, setWidth] = React.useState(0);
  const clamped = Math.min(Math.max(value, 0), 1);

  return (
    <View
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(Math.min(value, 1) * 100)}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      className={cn(
        "relative border-foreground",
        size === "md" ? "h-3 border-1.5" : "h-2 border",
        className,
      )}
    >
      {width > 0 ? (
        <MotiView
          from={{ width: 0 }}
          animate={{ width: clamped * width }}
          transition={motion.fill}
          className="absolute bottom-0 left-0 top-0 bg-foreground"
        />
      ) : null}
      {tick !== undefined ? (
        <View
          aria-hidden
          className="absolute -top-1.5 h-[18px] w-[1.5px] bg-foreground"
          style={{ left: `${Math.min(Math.max(tick, 0), 1) * 100}%` }}
        />
      ) : null}
    </View>
  );
}
