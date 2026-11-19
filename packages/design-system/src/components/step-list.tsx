import * as React from "react";
import { View } from "react-native";
import Svg, { Line } from "react-native-svg";

import { ENTER_OFFSET, useMotion } from "../lib/motion";
import { colors } from "../lib/theme";
import { cn } from "../lib/utils";
import { MotiView } from "./motion";
import { Text } from "./text";

type StepListProps = {
  steps: { title: string; description?: string }[];
  /** "dark" on the black onboarding screen, "light" elsewhere. */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * A numbered sequence joined by a dotted line, for real processes only (setup, import).
 * Steps arrive one after another.
 */
export function StepList({ steps, tone = "light", className }: StepListProps) {
  const motion = useMotion();
  const ink = tone === "dark" ? colors.paper : colors.ink;
  const text = tone === "dark" ? "text-primary-foreground" : "text-foreground";

  return (
    <View role="list" className={className}>
      {steps.map((step, i) => (
        <View key={step.title} role="listitem">
          {i > 0 ? (
            <Svg width={4} height={26} style={{ marginLeft: 22 }} aria-hidden>
              <Line
                x1={1}
                y1={1}
                x2={1}
                y2={26}
                stroke={ink}
                strokeWidth={2}
                strokeDasharray="0.1 4"
                strokeLinecap="round"
              />
            </Svg>
          ) : null}
          <MotiView
            from={{ opacity: 0, translateY: ENTER_OFFSET }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={motion.enter}
            delay={i * 60}
            className="flex-row items-center gap-[18px]"
          >
            <View
              className="h-[46px] w-[46px] items-center justify-center border-1.5"
              style={{ borderColor: ink }}
            >
              <Text className={cn("font-display text-[20px] leading-6", text)}>{i + 1}</Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="headline" className={text}>
                {step.title}
              </Text>
              {step.description ? (
                <Text variant="caption" className={text}>
                  {step.description}
                </Text>
              ) : null}
            </View>
          </MotiView>
        </View>
      ))}
    </View>
  );
}
