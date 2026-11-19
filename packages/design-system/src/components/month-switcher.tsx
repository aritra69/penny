import * as React from "react";
import { View } from "react-native";

import { useMotion } from "../lib/motion";
import { IconButton } from "./icon-button";
import { MotiText } from "./motion";

type MonthSwitcherProps = {
  /** "November 2026". */
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  /** False on the current month: there is nothing after today. */
  canGoNext: boolean;
};

/** Header control for month-based screens (Spending). The month name slides in when it changes. */
export function MonthSwitcher({ label, onPrevious, onNext, canGoNext }: MonthSwitcherProps) {
  const motion = useMotion();
  return (
    <View className="flex-row items-center justify-between px-3 pb-2 pt-6">
      <IconButton icon="chevron-left" label="Previous month" onPress={onPrevious} />
      <MotiText
        key={label}
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={motion.enter}
        aria-live="polite"
        className="font-sans-bold text-body-lg text-foreground"
      >
        {label}
      </MotiText>
      <IconButton icon="chevron-right" label="Next month" onPress={onNext} disabled={!canGoNext} />
    </View>
  );
}
