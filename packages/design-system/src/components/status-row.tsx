import * as React from "react";
import { View } from "react-native";

import { useMotion } from "../lib/motion";
import { colors } from "../lib/theme";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Icon } from "./icon";
import { MotiView } from "./motion";
import { Text } from "./text";

type StatusRowProps = {
  title: string;
  /** What the state means: "Allowed", "So Android doesn't put Penny to sleep". */
  subtitle?: string;
  /** Done rows are marked with the highlighter and a tick, like a line crossed off a list. */
  done: boolean;
  /** What to do about a row that isn't done. Hidden once it is. */
  action?: { label: string; onPress: () => void; disabled?: boolean };
  /** A rule above the row, for rows that follow other content. */
  divider?: boolean;
  className?: string;
};

/**
 * Something the user has to switch on once, and whether it is on: a permission, a connection.
 * Bleeds to the screen edges like SelectRow, but it reports a state instead of taking a choice.
 */
export function StatusRow({ title, subtitle, done, action, divider, className }: StatusRowProps) {
  const motion = useMotion();
  return (
    <MotiView
      animate={{ backgroundColor: done ? colors.highlight : colors.paper }}
      transition={motion.enter}
      className={cn("-mx-gutter px-gutter", className)}
    >
      <View
        className={cn(
          "flex-row items-center gap-3 py-2",
          done ? "min-h-16" : "min-h-[72px]",
          divider && !done && "border-t border-foreground",
        )}
      >
        <View className="flex-1 gap-0.5">
          <Text className="font-sans-bold text-body-lg">{title}</Text>
          {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
        </View>
        {done ? (
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={motion.select}
            aria-hidden
          >
            <Icon name="check" size={22} />
          </MotiView>
        ) : action ? (
          <Button
            variant="outline"
            size="sm"
            className="px-3.5"
            disabled={action.disabled}
            onPress={action.onPress}
          >
            <Text className="font-sans-bold">{action.label}</Text>
          </Button>
        ) : null}
      </View>
    </MotiView>
  );
}
