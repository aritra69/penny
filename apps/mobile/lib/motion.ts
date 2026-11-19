import type { MotiTransitionProp, TransitionConfig } from "moti";
import { Easing, useReducedMotion } from "react-native-reanimated";

/**
 * Moti types a component's `transition` prop as a map keyed by its animated styles, which a
 * plain config doesn't satisfy, though Moti accepts one at runtime. This narrows it once.
 */
const transition = (config: TransitionConfig) => config as MotiTransitionProp;

/**
 * Penny's motion presets for Moti. Motion is quick and plain: things settle into place,
 * nothing bounces for show. Use the hook so the system "Remove animations" setting is respected.
 */
const presets = {
  /** Press feedback on buttons and tiles. */
  press: transition({ type: "timing", duration: 90 }),
  /** Elements arriving: chat bubbles, draft cards, banners. */
  enter: transition({ type: "timing", duration: 240, easing: Easing.out(Easing.cubic) }),
  /** Selection changes: checkmarks, the tab dot, chosen cards. */
  select: transition({ type: "spring", damping: 20, stiffness: 260, mass: 0.8 }),
  /** Bars and lines filling to their value. */
  fill: transition({ type: "timing", duration: 650, easing: Easing.out(Easing.cubic) }),
};

export type MotionPreset = keyof typeof presets;

const instant = transition({ type: "timing", duration: 0 });
const reduced: Record<MotionPreset, MotiTransitionProp> = {
  press: instant,
  enter: instant,
  select: instant,
  fill: instant,
};

/** Returns the transition presets, or instant ones when the user turned animations off. */
export function useMotion(): Record<MotionPreset, MotiTransitionProp> {
  return useReducedMotion() ? reduced : presets;
}

/** Starting offset for elements that slide in on entry. */
export const ENTER_OFFSET = 12;
