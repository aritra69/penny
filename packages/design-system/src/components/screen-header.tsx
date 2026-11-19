import * as React from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";
import { IconButton } from "./icon-button";
import { Text } from "./text";

type ScreenHeaderProps = {
  /** "back" for pushed screens, "close" for sheets and forms. Pair with `onLeadingPress`. */
  leading?: "back" | "close";
  onLeadingPress?: () => void;
  /** Sheet title ("New goal"), shown at the start, or centred when `align="center"`. */
  title?: string;
  /** A line under the title ("Every month from November"). */
  subtitle?: string;
  align?: "start" | "center";
  /** Onboarding position, e.g. "2 / 5". */
  step?: string;
  /** Right-hand actions: IconButtons. */
  trailing?: React.ReactNode;
  className?: string;
};

/**
 * The top of a screen: a 44dp back/close button, an optional title, and actions on the right.
 * No bar, no border: the header sits on the page.
 */
export function ScreenHeader({
  leading,
  onLeadingPress,
  title,
  subtitle,
  align = "start",
  step,
  trailing,
  className,
}: ScreenHeaderProps) {
  const leadingButton = leading ? (
    <IconButton
      icon={leading}
      label={leading === "back" ? "Back" : "Close"}
      onPress={onLeadingPress}
    />
  ) : null;

  const titleBlock = title ? (
    <View className={cn("min-w-0 flex-1 gap-0.5", align === "center" && "items-center")}>
      <Text variant="headline" numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
    </View>
  ) : (
    <View className="flex-1" />
  );

  // Sheets put the title first and close on the right, as in "New goal".
  const sheet = leading === "close" && align === "start";

  return (
    <View
      className={cn(
        "min-h-touch flex-row items-center gap-2 pt-6",
        sheet || !leading ? "pl-gutter pr-3" : "px-3",
        className,
      )}
    >
      {!sheet ? leadingButton : null}
      {titleBlock}
      {step ? (
        <Text variant="label" className="pr-2 font-sans-semibold">
          {step}
        </Text>
      ) : null}
      {trailing ? <View className="flex-row gap-1">{trailing}</View> : null}
      {sheet ? leadingButton : null}
    </View>
  );
}
