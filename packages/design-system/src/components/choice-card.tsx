import * as React from "react";
import { Image, type ImageSourcePropType, Pressable, View } from "react-native";

import { useMotion } from "../lib/motion";
import { colors } from "../lib/theme";
import { cn } from "../lib/utils";
import { Icon } from "./icon";
import { MotiView } from "./motion";
import { Text } from "./text";

type ChoiceGroupProps = {
  /** What is being chosen, for screen readers: "Funding", "Goal picture". */
  label: string;
  children: React.ReactNode;
  /** "grid": two cards a row · "column": stacked · "row": a scrolling strip of pictures. */
  layout?: "grid" | "column" | "row";
  className?: string;
};

/** Wraps ChoiceCards or PictureChoices as one radio group. */
export function ChoiceGroup({ label, children, layout = "column", className }: ChoiceGroupProps) {
  return (
    <View
      role="radiogroup"
      aria-label={label}
      className={cn(
        layout === "grid" && "flex-row gap-3",
        layout === "column" && "gap-2",
        layout === "row" && "flex-row gap-2.5",
        className,
      )}
    >
      {children}
    </View>
  );
}

/** The selected mark: a black square with a white tick, scaling in at a corner or along a side. */
function SelectedMark({ selected, side }: { selected: boolean; side: boolean }) {
  const motion = useMotion();
  return (
    <MotiView
      aria-hidden
      animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.6 }}
      transition={motion.select}
      className={cn(
        "absolute left-0 items-center justify-center bg-foreground",
        side ? "bottom-0 top-0 w-8" : "bottom-0 h-6 w-6",
      )}
    >
      <Icon name="check" size={side ? 18 : 14} color={colors.paper} strokeWidth={2.5} />
    </MotiView>
  );
}

type ChoiceCardProps = {
  title: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  /** "tile": square-ish card with a corner mark, two a row · "row": full width with a side mark. */
  variant?: "tile" | "row";
  className?: string;
};

/**
 * One option of a radio group. Selected: 2.5 border and a black mark; unselected: 1px border.
 * Never colour alone to show the choice.
 */
export function ChoiceCard({
  title,
  description,
  selected,
  onSelect,
  variant = "tile",
  className,
}: ChoiceCardProps) {
  const row = variant === "row";
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      onPress={onSelect}
      className={cn(
        "relative gap-1.5 bg-background p-3",
        selected ? "border-2.5 border-foreground" : "border border-foreground",
        row ? "gap-0.5" : "min-h-28 flex-1",
        row && selected && "pl-11",
        className,
      )}
    >
      <Text className="font-sans-bold text-body">{title}</Text>
      {description ? <Text variant={row ? "caption" : "small"}>{description}</Text> : null}
      <SelectedMark selected={selected} side={row} />
    </Pressable>
  );
}

type PictureChoiceProps = {
  /** Read by screen readers: "Laptop", "Piggy bank". */
  label: string;
  image: ImageSourcePropType;
  selected: boolean;
  onSelect: () => void;
};

/** An 88dp picture tile in a ChoiceGroup with layout "row" (goal pictures). */
export function PictureChoice({ label, image, selected, onSelect }: PictureChoiceProps) {
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onPress={onSelect}
      className={cn(
        "relative h-[88px] w-[88px] bg-background",
        selected ? "border-2.5 border-foreground" : "border border-foreground",
      )}
    >
      <Image source={image} className="h-full w-full" resizeMode="contain" />
      <SelectedMark selected={selected} side={false} />
    </Pressable>
  );
}
