import { AnimatePresence, MotiText, MotiView, motify } from "moti";
import { cssInterop } from "nativewind";
import { Pressable } from "react-native";

/**
 * Moti components that accept NativeWind `className`. Import animated primitives from here,
 * not from "moti" directly, or className is silently ignored.
 */
cssInterop(MotiView, { className: "style" });
cssInterop(MotiText, { className: "style" });

/** A Pressable whose own box can animate (press scale, fills). */
const AnimatedPressable = motify(Pressable)();
cssInterop(AnimatedPressable, { className: "style" });

export { AnimatedPressable, AnimatePresence, MotiText, MotiView };
