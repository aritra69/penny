import * as React from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

type InfoNoteProps = {
  /** Bold lead-in: "No duplicate found." */
  title?: string;
  /** The explanation, in plain words. */
  children: React.ReactNode;
  icon?: IconName;
  className?: string;
};

/**
 * A grey note explaining what Penny checked or why. Used inside draft cards and detail screens to
 * make AI and automatic decisions visible. Not for errors or warnings.
 */
export function InfoNote({ title, children, icon = "check-circle", className }: InfoNoteProps) {
  return (
    <View className={cn("flex-row items-start gap-2.5 bg-muted p-3", className)}>
      <Icon name={icon} size={20} />
      <Text variant="caption" className="flex-1">
        {title ? <Text className="font-sans-bold text-caption">{title} </Text> : null}
        {children}
      </Text>
    </View>
  );
}
