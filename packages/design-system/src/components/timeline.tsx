import * as React from "react";
import { View } from "react-native";
import Svg, { Line } from "react-native-svg";

import { ENTER_OFFSET, useMotion } from "../lib/motion";
import { colors } from "../lib/theme";
import { cn } from "../lib/utils";
import { Icon, type IconName } from "./icon";
import { MotiView } from "./motion";
import { Text } from "./text";

type TimelineItem = {
  /** "Today · 23 Nov", set small in capitals. */
  when: string;
  title: string;
  description?: string;
  icon: IconName;
  /**
   * "done": filled with ink, what has happened or happens now · "next": highlighter, the next
   * thing to look out for · "later": outlined.
   */
  tone: "done" | "next" | "later";
};

type TimelineProps = {
  items: TimelineItem[];
  /** Names the list for screen readers: "How your free month works". */
  label: string;
  className?: string;
};

const BOX = {
  done: "bg-primary",
  next: "border-2 border-foreground bg-highlight",
  later: "border-2 border-foreground bg-background",
};

/**
 * Dated steps down a rule, for something that unfolds over time (the free month). The rule is
 * solid after what is done and dotted after what is still to come. Items arrive one after another.
 */
export function Timeline({ items, label, className }: TimelineProps) {
  const motion = useMotion();
  return (
    <View role="list" aria-label={label} className={className}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <MotiView
            key={item.title}
            role="listitem"
            from={{ opacity: 0, translateY: ENTER_OFFSET }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={motion.enter}
            delay={i * 60}
            className="flex-row gap-4"
          >
            <View className="shrink-0 items-center">
              <View className={cn("h-10 w-10 items-center justify-center", BOX[item.tone])}>
                <Icon
                  name={item.icon}
                  size={20}
                  strokeWidth={1.75}
                  color={item.tone === "done" ? colors.paper : colors.ink}
                />
              </View>
              {last ? null : item.tone === "done" ? (
                <View aria-hidden className="min-h-[22px] w-[3px] flex-1 bg-foreground" />
              ) : (
                <DottedRule />
              )}
            </View>
            <View className={cn("flex-1 gap-[3px] pt-0.5", last ? "" : "pb-5")}>
              <Text className="font-sans-bold text-small uppercase tracking-[0.6px]">
                {item.when}
              </Text>
              <Text className="font-sans-bold text-body-lg">{item.title}</Text>
              {item.description ? <Text className="text-label">{item.description}</Text> : null}
            </View>
          </MotiView>
        );
      })}
    </View>
  );
}

/** A 3dp dotted rule that stretches to the item's height. */
function DottedRule() {
  const [height, setHeight] = React.useState(22);
  return (
    <View
      aria-hidden
      className="min-h-[22px] w-[3px] flex-1"
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
    >
      <Svg width={3} height={height}>
        <Line
          x1={1.5}
          y1={1.5}
          x2={1.5}
          y2={height}
          stroke={colors.ink}
          strokeWidth={3}
          strokeDasharray="0.1 6"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
