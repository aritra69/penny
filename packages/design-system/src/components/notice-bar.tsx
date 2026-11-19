import * as React from "react";
import { Pressable } from "react-native";

import { ENTER_OFFSET, useMotion } from "../lib/motion";
import { colors } from "../lib/theme";
import { Icon, type IconName } from "./icon";
import { MotiView } from "./motion";
import { Text } from "./text";

type NoticeBarProps = {
  /** One short line: "2 transactions need a look". */
  message: string;
  icon?: IconName;
  onPress?: () => void;
};

/**
 * A full-width black band for the one thing that needs the user now (transactions to review).
 * At most one per screen, directly under the header. Tapping it opens the thing it names.
 */
export function NoticeBar({ message, icon = "info", onPress }: NoticeBarProps) {
  const motion = useMotion();
  return (
    <MotiView
      from={{ opacity: 0, translateY: -ENTER_OFFSET }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={motion.enter}
    >
      <Pressable
        role={onPress ? "button" : undefined}
        onPress={onPress}
        className="min-h-14 flex-row items-center gap-3 bg-primary px-gutter active:opacity-85"
      >
        <Icon name={icon} size={22} color={colors.paper} />
        <Text className="flex-1 font-sans-semibold text-body text-primary-foreground">
          {message}
        </Text>
        {onPress ? <Icon name="chevron-right" size={18} color={colors.paper} /> : null}
      </Pressable>
    </MotiView>
  );
}
