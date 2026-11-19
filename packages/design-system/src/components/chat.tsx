import * as React from "react";
import { TextInput, View } from "react-native";

import { ENTER_OFFSET, useMotion } from "../lib/motion";
import { colors } from "../lib/theme";
import { cn } from "../lib/utils";
import { IconButton } from "./icon-button";
import { MotiView } from "./motion";
import { Text } from "./text";

/** What the user said: a black block on the right. Text only; attachments go above it. */
export function ChatBubble({ children }: { children: string }) {
  const motion = useMotion();
  return (
    <MotiView
      from={{ opacity: 0, translateY: ENTER_OFFSET }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={motion.enter}
      className="max-w-[280px] self-end bg-primary px-4 py-3"
    >
      <Text className="text-body text-primary-foreground">{children}</Text>
    </MotiView>
  );
}

/**
 * Penny's reply: plain text on the page, no bubble, so it reads as an answer rather than chatter.
 * Put DraftCards and notes inside as children, after the words.
 */
export function AssistantMessage({
  text,
  children,
  footnote,
}: {
  text: string;
  children?: React.ReactNode;
  /** How Penny read the request: "I read “60k” as ₹60,000…". */
  footnote?: string;
}) {
  const motion = useMotion();
  return (
    <MotiView
      from={{ opacity: 0, translateY: ENTER_OFFSET }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={motion.enter}
      className="gap-3.5"
    >
      <Text variant="body-lg">{text}</Text>
      {children}
      {footnote ? <Text variant="caption">{footnote}</Text> : null}
    </MotiView>
  );
}

type ChatComposerProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  /** Opens the picker for a screenshot or receipt. */
  onAttach?: () => void;
  placeholder?: string;
  /** The line under the box. Keep the data promise visible. */
  disclaimer?: string;
  className?: string;
};

/** The Ask Penny input: attach, type, send, in one outlined box above the tab bar. */
export function ChatComposer({
  value,
  onChangeText,
  onSend,
  onAttach,
  placeholder = "Ask about your money",
  disclaimer = "Answers use only the data on this phone. Check anything that looks off.",
  className,
}: ChatComposerProps) {
  const empty = value.trim().length === 0;
  return (
    <View className={cn("gap-1.5", className)}>
      <View className="min-h-[52px] flex-row items-center gap-1.5 border-1.5 border-foreground p-1">
        {onAttach ? (
          <IconButton icon="image" label="Attach a screenshot or receipt" onPress={onAttach} />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={() => !empty && onSend()}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedText}
          cursorColor={colors.ink}
          selectionColor={colors.ink}
          aria-label={placeholder}
          returnKeyType="send"
          className={cn("min-w-0 flex-1 font-sans text-body text-foreground", !onAttach && "pl-2")}
        />
        <IconButton icon="send" variant="solid" label="Send" onPress={onSend} disabled={empty} />
      </View>
      {disclaimer ? (
        <Text variant="micro" className="text-center">
          {disclaimer}
        </Text>
      ) : null}
    </View>
  );
}
