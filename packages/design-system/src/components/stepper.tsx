import * as React from "react";
import { View } from "react-native";

import { IconButton } from "./icon-button";
import { Text } from "./text";

type StepperProps = {
  onDecrease: () => void;
  onIncrease: () => void;
  /** Say what changes: "Less for Travel", "Decrease by ₹500". */
  decreaseLabel: string;
  increaseLabel: string;
  canDecrease?: boolean;
  canIncrease?: boolean;
  /** The number being nudged, shown between the buttons: "₹8,000". */
  value?: string;
};

/** Two square outlined buttons, − and +, for nudging a number by a fixed step. */
export function Stepper({
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
  canDecrease = true,
  canIncrease = true,
  value,
}: StepperProps) {
  return (
    <View className="flex-row items-center gap-2.5">
      <IconButton
        icon="minus"
        variant="outline"
        label={decreaseLabel}
        onPress={onDecrease}
        disabled={!canDecrease}
      />
      {value !== undefined ? (
        <Text aria-live="polite" className="w-[74px] text-center font-sans-bold text-body-lg">
          {value}
        </Text>
      ) : null}
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
