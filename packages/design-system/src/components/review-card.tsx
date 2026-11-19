import * as React from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";
import { Button } from "./button";
import { Icon } from "./icon";
import { Text } from "./text";

type ReviewCardProps = {
  /** Who: "Rahul S.", "paytm-98765432@ptys". */
  title: string;
  /** The amount, usually an <Amount variant="figure" sign="always" />. */
  amount: React.ReactNode;
  /** "Yesterday, 10:41 pm · SBI UPI". */
  meta: string;
  /** Penny's question, in the user's terms: "Did Rahul pay you back, or is this income?" */
  question: string;
  /** Two answers. Put Penny's guess first; it gets the primary button. */
  answers?: [{ label: string; onPress: () => void }, { label: string; onPress: () => void }];
  /** When there's no quick answer: a row that opens the full review. */
  onOpen?: () => void;
  /** What the answer changes: "Paid-back money lowers what you spent on dinner." */
  footnote?: string;
  className?: string;
};

/** A transaction Penny wasn't sure about, with the question it needs answered. */
export function ReviewCard({
  title,
  amount,
  meta,
  question,
  answers,
  onOpen,
  footnote,
  className,
}: ReviewCardProps) {
  return (
    <View className={cn("gap-3 border-1.5 border-foreground p-4", className)}>
      <View className="flex-row items-baseline justify-between gap-3">
        <Text variant="strong" className="flex-1" numberOfLines={1}>
          {title}
        </Text>
        {amount}
      </View>
      <Text variant="caption">{meta}</Text>
      <Text variant="strong">{question}</Text>
      {answers ? (
        <View className="flex-row gap-2.5">
          <Button className="flex-1" onPress={answers[0].onPress}>
            <Text>{answers[0].label}</Text>
          </Button>
          <Button variant="outline" className="flex-1" onPress={answers[1].onPress}>
            <Text>{answers[1].label}</Text>
          </Button>
        </View>
      ) : null}
      {onOpen ? (
        <Button
          variant="ghost"
          className="min-h-12 justify-between border-t border-foreground px-0"
          onPress={onOpen}
        >
          <Text>Sort it out</Text>
          <Icon name="chevron-right" size={18} />
        </Button>
      ) : null}
      {footnote ? <Text variant="small">{footnote}</Text> : null}
    </View>
  );
}
