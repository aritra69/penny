import * as React from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";
import { Input, type InputProps } from "./input";
import { Label } from "./label";
import { Stepper } from "./stepper";
import { Text } from "./text";

type AmountFieldProps = Omit<InputProps, "variant" | "keyboardType" | "inputMode"> & {
  label: string;
  /** "Changes in steps of ₹500. Your usual month is ₹7,300." */
  hint?: string;
  /** Adds − and + buttons. `step` names the amount for screen readers: "₹500". */
  stepper?: { step: string; onDecrease: () => void; onIncrease: () => void };
  containerClassName?: string;
};

/**
 * A money input set in the display face, optionally with − / + steppers on its underline.
 * The caller formats the value ("₹8,000") and parses input; keep the underline under both.
 */
export function AmountField({
  label,
  hint,
  stepper,
  containerClassName,
  className,
  ...inputProps
}: AmountFieldProps) {
  const id = React.useId();
  return (
    <View className={cn("gap-2", containerClassName)}>
      <Label nativeID={`${id}-label`}>{label}</Label>
      <View
        className={cn(
          "flex-row items-center gap-2.5",
          stepper && "border-b-2.5 border-foreground pb-1.5",
        )}
      >
        <Input
          variant="amount"
          inputMode="numeric"
          keyboardType="number-pad"
          aria-labelledby={`${id}-label`}
          className={cn("flex-1", stepper && "border-b-0 pb-0", className)}
          {...inputProps}
        />
        {stepper ? (
          <Stepper
            decreaseLabel={`Decrease by ${stepper.step}`}
            increaseLabel={`Increase by ${stepper.step}`}
            onDecrease={stepper.onDecrease}
            onIncrease={stepper.onIncrease}
          />
        ) : null}
      </View>
      {hint ? <Text variant="caption">{hint}</Text> : null}
    </View>
  );
}
