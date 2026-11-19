import * as React from "react";
import { View } from "react-native";

import { useMotion } from "../lib/motion";
import { cn } from "../lib/utils";
import { MotiView } from "./motion";
import { Text } from "./text";

type BigFigureProps = {
  /** What the number is: "Left to spend in November". */
  label: string;
  /** The figure, usually an <Amount variant="figure-xl" />. */
  children: React.ReactNode;
  /** One plain line that makes the number useful: "₹1,185 a day for 12 days". */
  caption?: string;
  /** Changes when the figure changes, so it can animate in. */
  valueKey?: string | number;
  className?: string;
};

/** The one number a screen is about, set huge. One per screen, near the top. */
export function BigFigure({ label, children, caption, valueKey, className }: BigFigureProps) {
  const motion = useMotion();
  return (
    <View className={cn("gap-1.5 px-gutter pt-6", className)}>
      <Text variant="label">{label}</Text>
      <MotiView
        key={valueKey}
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={motion.enter}
      >
        {children}
      </MotiView>
      {caption ? <Text variant="body">{caption}</Text> : null}
    </View>
  );
}
