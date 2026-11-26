import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  View,
  type ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn, colors, ScreenHeader, Text } from "@repo/design-system";

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
      // On both platforms: Android is edge-to-edge, so the window doesn't resize for the keyboard.
      behavior="padding"
    >
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
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
 * A picture from the design canvas, cropped to a band like the boards do. The art is black ink
 * on a transparent background, so it is tinted with the ink token, the way icons are: it follows
 * the theme's ink rather than the system setting (Penny is light-only).
 * Without a `source` (pictures not in the app's assets yet) it holds the place in grey.
 */
export function IllustrationSlot({
  source,
  aspectRatio = 3 / 2,
  height,
  className,
}: {
  source?: ImageSourcePropType;
  /** Width over height of the picture. The hero scenes are 3:2. */
  aspectRatio?: number;
  height: number;
  className?: string;
}) {
  if (!source) {
    return <View aria-hidden className={cn("mx-gutter bg-muted", className)} style={{ height }} />;
  }
  return (
    // Decorative: the headline under it says what the screen is for.
    <View aria-hidden className={cn("mx-gutter overflow-hidden", className)} style={{ height }}>
      <Image
        source={source}
        tintColor={colors.ink}
        // Full width, anchored to the bottom: any crop comes off the sky, not the ground.
        resizeMode="contain"
        style={{ position: "absolute", bottom: 0, width: "100%", height: undefined, aspectRatio }}
      />
    </View>
  );
}
