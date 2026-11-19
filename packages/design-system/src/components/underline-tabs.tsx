import * as React from "react";
import { Pressable, View } from "react-native";

import { useMotion } from "../lib/motion";
import { cn } from "../lib/utils";
import { MotiView } from "./motion";
import { Text } from "./text";

type UnderlineTabsProps<T extends string> = {
  /** What the tabs switch, for screen readers ("View"). */
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * Text tabs over a 1px rule; the chosen one is bold with a 3px bar. For switching views of the
 * same data (Budgets / Categories / Merchants), not for navigation.
 */
export function UnderlineTabs<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: UnderlineTabsProps<T>) {
  const motion = useMotion();
  return (
    <View
      role="tablist"
      aria-label={label}
      className={cn("flex-row gap-6 border-b border-foreground", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            role="tab"
            aria-selected={selected}
            onPress={() => onChange(option.value)}
            className="-mb-px min-h-touch justify-end"
          >
            <Text
              className={cn("pb-2.5 text-body", selected ? "font-sans-bold" : "font-sans-medium")}
            >
              {option.label}
            </Text>
            <MotiView
              aria-hidden
              animate={{ scaleX: selected ? 1 : 0 }}
              transition={motion.select}
              className="h-[3px] bg-foreground"
            />
          </Pressable>
        );
      })}
    </View>
  );
}
