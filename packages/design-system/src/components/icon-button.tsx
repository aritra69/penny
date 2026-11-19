import * as React from "react";
import { type Pressable, View } from "react-native";

import { Icon, type IconName } from "./icon";
import { AnimatedPressable, MotiView } from "./motion";
import { useMotion } from "../lib/motion";
import { colors } from "../lib/theme";
import { cn } from "../lib/utils";

type IconButtonVariant = "ghost" | "outline" | "solid";

type IconButtonProps = Omit<React.ComponentProps<typeof Pressable>, "children" | "style"> & {
  icon: IconName;
  /** Read by screen readers. Required: the icon alone says nothing. */
  label: string;
  /** ghost: header actions · outline: steppers · solid: send. */
  variant?: IconButtonVariant;
  /** Icon size. Header and tab icons are 26. */
  iconSize?: number;
  /** A small ink dot at the top right, e.g. unread notifications. */
  dot?: boolean;
  /** Icon colour on dark surfaces. Solid buttons are always white on ink. */
  color?: string;
};

const VARIANT: Record<IconButtonVariant, string> = {
  ghost: "bg-transparent",
  outline: "border-1.5 border-foreground bg-background",
  solid: "bg-primary",
};

/** A 44×44 tap target holding one icon. */
function IconButton({
  icon,
  label,
  variant = "ghost",
  iconSize = 26,
  dot,
  color,
  disabled,
  className,
  ...props
}: IconButtonProps) {
  const motion = useMotion();
  const [pressed, setPressed] = React.useState(false);
  const ink = variant === "solid" ? colors.paper : (color ?? colors.ink);

  return (
    <AnimatedPressable
      role="button"
      aria-label={label}
      aria-disabled={!!disabled}
      disabled={disabled}
      hitSlop={4}
      className={cn(
        "h-touch w-touch items-center justify-center",
        VARIANT[variant],
        disabled && "opacity-30",
        className,
      )}
      animate={{ scale: pressed ? 0.92 : 1 }}
      transition={motion.press}
      onPressIn={(e) => {
        setPressed(true);
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        props.onPressOut?.(e);
      }}
      {...props}
    >
      <Icon name={icon} size={variant === "ghost" ? iconSize : 20} color={ink} />
      {dot ? (
        <View className="absolute right-2.5 top-2.5" aria-hidden>
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={motion.select}
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: ink }}
          />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

export { IconButton };
export type { IconButtonProps };
