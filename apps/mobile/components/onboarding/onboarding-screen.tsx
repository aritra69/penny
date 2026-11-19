import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn, ScreenHeader, Text } from "@repo/design-system";

type OnboardingScreenProps = {
  /** "dark" for the black screens (setup steps, SMS allowed). */
  tone?: "light" | "dark";
  /** Header button. Leave out on screens with no way back. */
  leading?: "back" | "close";
  onLeadingPress?: () => void;
  /** "2 / 5" on the numbered steps. */
  counter?: string;
  children: React.ReactNode;
  /** Pinned to the bottom: the screen's main button and its quiet alternative. */
  footer?: React.ReactNode;
};

/** The frame every onboarding screen shares: header, scrolling content, buttons at the bottom. */
export function OnboardingScreen({
  tone = "light",
  leading,
  onLeadingPress,
  counter,
  children,
  footer,
}: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const dark = tone === "dark";
  return (
    <KeyboardAvoidingView
      className={cn("flex-1", dark ? "bg-primary" : "bg-background")}
      style={{ paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style={dark ? "light" : "dark"} />
      {leading ? (
        <ScreenHeader leading={leading} onLeadingPress={onLeadingPress} step={counter} />
      ) : null}
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow pb-6"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer ? (
        <View
          className="gap-1 px-gutter pt-2"
          style={{ paddingBottom: Math.max(32, insets.bottom + 12) }}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

/** A step's question and the line under it. */
export function StepIntro({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <View className="gap-2.5 px-gutter pt-6">
      <Text variant="title">{title}</Text>
      {children ? <Text>{children}</Text> : null}
    </View>
  );
}

/** Title and line for the result screens ("Your key works", "You're all set"). */
export function ResultIntro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2.5 px-gutter pt-9">
      <Text role="heading" aria-level={1} className="font-display text-[26px] leading-8">
        {title}
      </Text>
      <Text>{children}</Text>
    </View>
  );
}

/**
 * Where a picture from the design canvas goes. The pictures aren't in the app's assets yet, so
 * this holds their place with the placeholder tone.
 */
export function IllustrationSlot({ height, className }: { height: number; className?: string }) {
  return <View aria-hidden className={cn("mx-gutter bg-muted", className)} style={{ height }} />;
}
