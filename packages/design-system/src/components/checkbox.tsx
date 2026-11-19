import * as React from "react";
import { Pressable, View } from "react-native";

import { useMotion } from "../lib/motion";
import { colors } from "../lib/theme";
import { cn } from "../lib/utils";
import { Icon } from "./icon";
import { MotiView } from "./motion";
import { Text } from "./text";

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Required when the box stands alone; CheckRow passes its text. */
  label: string;
  disabled?: boolean;
};

/** A 22dp square: outlined when off, filled with ink and a white tick when on. */
export function Checkbox({ checked, onCheckedChange, label, disabled }: CheckboxProps) {
  return (
    <Pressable
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      aria-disabled={!!disabled}
      disabled={disabled}
      hitSlop={11}
      onPress={() => onCheckedChange(!checked)}
      className={cn(disabled && "opacity-35")}
    >
      <CheckboxBox checked={checked} />
    </Pressable>
  );
}

/** The visual box alone, for rows that handle the press themselves. */
export function CheckboxBox({ checked }: { checked: boolean }) {
  const motion = useMotion();
  return (
    <View
      aria-hidden
      className={cn(
        "h-[22px] w-[22px] items-center justify-center border-1.5 border-foreground",
        checked && "bg-foreground",
      )}
    >
      <MotiView animate={{ scale: checked ? 1 : 0 }} transition={motion.select}>
        <Icon name="check" size={16} color={colors.paper} strokeWidth={2.5} />
      </MotiView>
    </View>
  );
}

type CheckRowProps = CheckboxProps & {
  /** A second line under the label. */
  description?: string;
  className?: string;
};

/** A full-width row between rules; the whole row toggles. "Apply to every month". */
export function CheckRow({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
}: CheckRowProps) {
  return (
    <Pressable
      role="checkbox"
      aria-checked={checked}
      aria-disabled={!!disabled}
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      className={cn(
        "min-h-[52px] flex-row items-center gap-3 border-y border-foreground py-2 active:bg-muted",
        disabled && "opacity-35",
        className,
      )}
    >
      <CheckboxBox checked={checked} />
      <View className="flex-1 gap-0.5">
        <Text variant="strong">{label}</Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </View>
    </Pressable>
  );
}
