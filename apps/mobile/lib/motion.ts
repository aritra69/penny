import type { TransitionConfig } from "moti";
import { Easing, useReducedMotion } from "react-native-reanimated";

/**
 * Penny's motion presets for Moti. Motion is quick and plain: things settle into place,
 * nothing bounces for show. Use the hook so the system "Remove animations" setting is respected.
 */
const presets = {
  /** Press feedback on buttons and tiles. */
  press: { type: "timing", duration: 90 },
  /** Elements arriving: chat bubbles, draft cards, banners. */
  enter: { type: "timing", duration: 240, easing: Easing.out(Easing.cubic) },
  /** Selection changes: checkmarks, the tab dot, chosen cards. */
  select: { type: "spring", damping: 20, stiffness: 260, mass: 0.8 },
  /** Bars and lines filling to their value. */
  fill: { type: "timing", duration: 650, easing: Easing.out(Easing.cubic) },
} satisfies Record<string, TransitionConfig>;

export type MotionPreset = keyof typeof presets;

const instant: TransitionConfig = { type: "timing", duration: 0 };

/** Returns the transition presets, or instant ones when the user turned animations off. */
export function useMotion(): Record<MotionPreset, TransitionConfig> {
  const reduce = useReducedMotion();
  if (!reduce) return presets;
  return { press: instant, enter: instant, select: instant, fill: instant };
}

/** Starting offset for elements that slide in on entry. */
export const ENTER_OFFSET = 12;
