import * as React from "react";
import { Image, type ImageSourcePropType, View } from "react-native";

import { useMotion } from "../lib/motion";
import { cn } from "../lib/utils";
import { AnimatedPressable } from "./motion";
import { Text } from "./text";

type StatBoxProps = {
  /** "Emergency fund", "Bills to go", "Net worth". */
  label: string;
  /** The figure, usually an <Amount variant="figure" />. */
  children: React.ReactNode;
  /** One short line: "61% of ₹3L", "Next: Airtel, Fri". */
  caption?: string;
  /** A spot illustration, tucked into the bottom-right corner and cropped by the box. */
  image?: ImageSourcePropType;
  onPress?: () => void;
  className?: string;
};

/**
 * The bordered box used for goals and Home summaries, two to a row. The illustration is part of
 * the box's identity; keep one per box and never more than four boxes on a screen.
 */
export function StatBox({ label, children, caption, image, onPress, className }: StatBoxProps) {
  const motion = useMotion();
  const [pressed, setPressed] = React.useState(false);
  return (
    <AnimatedPressable
      role={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      animate={{ scale: pressed ? 0.98 : 1 }}
      transition={motion.press}
      className={cn(
        "relative h-[168px] flex-1 gap-0.5 overflow-hidden border-1.5 border-foreground bg-background p-3",
        className,
      )}
    >
      <Text variant="caption-strong">{label}</Text>
      {children}
      {caption ? <Text variant="small">{caption}</Text> : null}
      {image ? (
        <View className="absolute -bottom-2 -right-1.5" aria-hidden>
          <Image source={image} className="h-28 w-28" resizeMode="contain" />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}
