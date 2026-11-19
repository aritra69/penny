import * as React from "react";
import { View } from "react-native";

import { ENTER_OFFSET, useMotion } from "../lib/motion";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { MotiView } from "./motion";
import { Text } from "./text";

type DraftCardProps = {
  /** "Draft transaction", "Draft goal". */
  title: string;
  /** Saved state, shown on the header: "Not saved". */
  status?: string;
  /** The draft's fields: a figure, KeyValueRows, an InfoNote, a ChoiceGroup. */
  children: React.ReactNode;
  /** "Confirm", "Create goal". The only way the draft is saved. */
  confirmLabel: string;
  onConfirm: () => void;
  onEdit?: () => void;
  onDiscard?: () => void;
  className?: string;
};

/**
 * Anything Penny's AI prepares — a missed transaction, a goal — arrives as a draft the user
 * confirms. Nothing is saved until they press the primary button. Black header, outlined body,
 * Confirm / Edit side by side, Discard as a quiet link.
 */
export function DraftCard({
  title,
  status = "Not saved",
  children,
  confirmLabel,
  onConfirm,
  onEdit,
  onDiscard,
  className,
}: DraftCardProps) {
  const motion = useMotion();
  return (
    <MotiView
      from={{ opacity: 0, translateY: ENTER_OFFSET }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={motion.enter}
      className={cn("border-1.5 border-foreground bg-background", className)}
    >
      <View className="flex-row items-center justify-between bg-primary px-3.5 py-2.5">
        <Text className="font-sans-bold text-caption text-primary-foreground">{title}</Text>
        <Text className="text-small text-primary-foreground">{status}</Text>
      </View>
      <View className="gap-1 px-3.5 pt-3.5">{children}</View>
      <View className="flex-row gap-2.5 px-3.5 pb-3.5 pt-4">
        <Button className="flex-1" onPress={onConfirm}>
          <Text>{confirmLabel}</Text>
        </Button>
        {onEdit ? (
          <Button variant="outline" className="flex-1" onPress={onEdit}>
            <Text>Edit</Text>
          </Button>
        ) : null}
      </View>
      {onDiscard ? (
        <Button variant="link" size="sm" className="mb-3 self-center" onPress={onDiscard}>
          <Text>Discard</Text>
        </Button>
      ) : null}
    </MotiView>
  );
}
