import * as React from "react";
import { View } from "react-native";

import { IconButton } from "./icon-button";

type StepperProps = {
  onDecrease: () => void;
  onIncrease: () => void;
  /** Say what changes: "Less for Travel", "Decrease by ₹500". */
  decreaseLabel: string;
  increaseLabel: string;
  canDecrease?: boolean;
  canIncrease?: boolean;
};

/** Two square outlined buttons, − and +, for nudging a number by a fixed step. */
export function Stepper({
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
  canDecrease = true,
  canIncrease = true,
}: StepperProps) {
  return (
    <View className="flex-row gap-2.5">
      <IconButton
        icon="minus"
        variant="outline"
        label={decreaseLabel}
        onPress={onDecrease}
        disabled={!canDecrease}
      />
      <IconButton
        icon="plus"
        variant="outline"
        label={increaseLabel}
        onPress={onIncrease}
        disabled={!canIncrease}
      />
    </View>
  );
}
