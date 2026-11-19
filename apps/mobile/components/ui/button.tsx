import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { type Pressable, View } from "react-native";
import Svg, { Line } from "react-native-svg";

import { AnimatedPressable } from "@/components/ui/motion";
import { TextClassContext } from "@/components/ui/text";
import { useMotion } from "@/lib/motion";
import { colors } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Square, flat, full-weight buttons. One primary (black) action per screen or card;
 * a secondary (outlined) beside it; a dotted link for the quiet way out ("Discard", "Skip").
 */
const buttonVariants = cva("shrink-0 flex-row items-center justify-center gap-3", {
  variants: {
    variant: {
      default: "bg-primary",
      outline: "border-1.5 border-foreground bg-background",
      secondary: "border-1.5 border-foreground bg-background",
      /** White button on a black screen (onboarding steps). */
      inverse: "bg-background",
      ghost: "bg-transparent",
      destructive: "bg-destructive",
      link: "bg-transparent",
    },
    size: {
      default: "min-h-12 px-5",
      lg: "min-h-14 px-6",
      sm: "min-h-10 px-4",
      icon: "h-touch w-touch",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const buttonTextVariants = cva("font-sans-bold text-body text-foreground", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      outline: "",
      secondary: "",
      inverse: "",
      ghost: "",
      destructive: "text-destructive-foreground",
      link: "font-sans-semibold text-label",
    },
    size: {
      default: "",
      lg: "text-body-lg",
      sm: "font-sans-semibold text-label",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = Omit<React.ComponentProps<typeof Pressable>, "children" | "style"> &
  VariantProps<typeof buttonVariants> & {
    children?: React.ReactNode;
  };

function Button({ className, variant, size, disabled, children, ...props }: ButtonProps) {
  const motion = useMotion();
  const [pressed, setPressed] = React.useState(false);
  const isLink = variant === "link";

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <AnimatedPressable
        role="button"
        aria-disabled={!!disabled}
        disabled={disabled}
        className={cn(buttonVariants({ variant, size }), disabled && "opacity-35", className)}
        animate={{ scale: pressed && !isLink ? 0.97 : 1, opacity: pressed && isLink ? 0.55 : 1 }}
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
        {isLink ? <DottedUnderline>{children}</DottedUnderline> : children}
      </AnimatedPressable>
    </TextClassContext.Provider>
  );
}

/**
 * Penny's link style: a 2px dotted rule under the words. Drawn with SVG because Android
 * ignores dotted text decoration.
 */
function DottedUnderline({
  children,
  color = colors.ink,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <View className="items-stretch">
      {children}
      <Svg height={4} width="100%" aria-hidden style={{ marginTop: 2 }}>
        <Line
          x1={1}
          y1={2}
          x2="100%"
          y2={2}
          stroke={color}
          strokeWidth={2}
          strokeDasharray="0.1 4"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export { Button, buttonTextVariants, buttonVariants, DottedUnderline };
export type { ButtonProps };
