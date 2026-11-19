import { Image, Pressable, View, type ImageSourcePropType } from "react-native";

import { cn, colors, Icon, MotiView, Text, useMotion } from "@repo/design-system";

type FigureChoiceProps = {
  label: string;
  /** One picture holding both figures side by side; each choice shows its half. */
  image: ImageSourcePropType;
  side: "left" | "right";
  selected: boolean;
  onSelect: () => void;
};

/** How much of the square picture's height the figures use, from this far down. */
const CROP = { aspectRatio: 627 / 1060, top: "-13%" } as const;

/**
 * One of two people to pick between: a tall tile with the figure and its name. Chosen: the
 * highlighter behind the figure, a 2.5 border and a black tick, so it never relies on colour alone.
 * Put two in a `role="radiogroup"`.
 */
export function FigureChoice({ label, image, side, selected, onSelect }: FigureChoiceProps) {
  const motion = useMotion();
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onPress={onSelect}
      className={cn(
        "flex-1 border-foreground bg-background",
        // The thinner border gets padding so the picture doesn't shift when the choice changes.
        selected ? "border-2.5" : "border p-[1.5px]",
      )}
    >
      <MotiView
        animate={{ backgroundColor: selected ? colors.highlight : colors.paper }}
        transition={motion.enter}
        className="overflow-hidden"
        style={{ aspectRatio: CROP.aspectRatio }}
      >
        <Image
          aria-hidden
          source={image}
          tintColor={colors.ink}
          resizeMode="contain"
          style={{
            position: "absolute",
            top: CROP.top,
            left: side === "left" ? 0 : "-100%",
            width: "200%",
            height: undefined,
            aspectRatio: 1,
          }}
        />
        <MotiView
          aria-hidden
          animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.6 }}
          transition={motion.select}
          className="absolute bottom-0 left-0 h-7 w-7 items-center justify-center bg-foreground"
        >
          <Icon name="check" size={16} color={colors.paper} strokeWidth={2.5} />
        </MotiView>
      </MotiView>
      <View className="min-h-touch items-center justify-center border-t border-foreground">
        <Text className="font-sans-bold text-body-lg">{label}</Text>
      </View>
    </Pressable>
  );
}
