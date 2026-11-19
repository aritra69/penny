import * as React from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";
import { Text } from "./text";

/** A 1px rule with words in the middle, between two ways of doing the same thing ("or with email"). */
export function LabeledDivider({ label, className }: { label: string; className?: string }) {
  return (
    <View className={cn("flex-row items-center gap-3", className)}>
      <View className="h-px flex-1 bg-foreground" />
      <Text variant="caption">{label}</Text>
      <View className="h-px flex-1 bg-foreground" />
    </View>
  );
}
