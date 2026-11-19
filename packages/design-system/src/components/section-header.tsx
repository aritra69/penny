import * as React from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";
import { Button } from "./button";
import { Text } from "./text";

type SectionHeaderProps = {
  title: string;
  /** A dotted link on the right: "All goals", "See all". */
  action?: { label: string; onPress: () => void };
  /** Quiet context on the right instead of a link: "last 7 days". */
  meta?: string;
  className?: string;
};

/** Section title in the display face, with an optional link or note aligned to its baseline. */
export function SectionHeader({ title, action, meta, className }: SectionHeaderProps) {
  return (
    <View className={cn("flex-row items-end justify-between gap-3 pb-1.5", className)}>
      <Text variant="heading" className="flex-1">
        {title}
      </Text>
      {action ? (
        <Button variant="link" size="sm" className="min-h-0 px-0" onPress={action.onPress}>
          <Text>{action.label}</Text>
        </Button>
      ) : meta ? (
        <Text variant="caption">{meta}</Text>
      ) : null}
    </View>
  );
}
