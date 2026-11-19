import * as React from "react";
import { Pressable, View } from "react-native";

import { useMotion } from "../lib/motion";
import { colors } from "../lib/theme";
import { cn } from "../lib/utils";
import { Icon } from "./icon";
import { MotiView } from "./motion";
import { Text } from "./text";

type SelectRowProps = {
  title: string;
  subtitle?: string;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  className?: string;
};

/**
 * A row picked from a list by highlighting it, like a marker over a printed list
 * ("Which apps can Penny read?"). Bleeds to the screen edges; put it in a `role="group"` with a label.
 */
export function SelectRow({
  title,
  subtitle,
  selected,
  onSelectedChange,
  className,
}: SelectRowProps) {
  const motion = useMotion();
  return (
    <Pressable
      role="checkbox"
      aria-checked={selected}
      onPress={() => onSelectedChange(!selected)}
      className={cn("-mx-gutter", className)}
    >
      <MotiView
        animate={{ backgroundColor: selected ? colors.highlight : colors.paper }}
        transition={motion.enter}
        className="min-h-16 flex-row items-center gap-3 px-gutter py-2"
      >
        <View className="flex-1 gap-0.5">
          <Text className="font-sans-bold text-body-lg">{title}</Text>
          {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
        </View>
        <MotiView
          animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
          transition={motion.select}
          aria-hidden
        >
          <Icon name="check" size={22} />
        </MotiView>
      </MotiView>
    </Pressable>
  );
}
