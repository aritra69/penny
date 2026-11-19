// Penny design system. Apps import everything from "@repo/design-system".

// Tokens and helpers
export { accentOptions, colors, fonts, layout, strokes } from "./lib/theme";
export { ENTER_OFFSET, useMotion, type MotionPreset } from "./lib/motion";
export {
  currencySymbol,
  formatMoney,
  formatMoneyCompact,
  type FormatMoneyOptions,
  type SignDisplay,
} from "./lib/money";
export { cn } from "./lib/utils";

// Animation primitives (Moti, wired for className)
export { AnimatedPressable, AnimatePresence, MotiText, MotiView } from "./components/motion";

// Foundations
export { Text, TextClassContext, textVariants, type TextVariant } from "./components/text";
export { Icon, iconNames, type IconName } from "./components/icon";

// Actions
export {
  Button,
  buttonTextVariants,
  buttonVariants,
  DottedUnderline,
  type ButtonProps,
} from "./components/button";
export { IconButton, type IconButtonProps } from "./components/icon-button";

// Forms
export { Input } from "./components/input";
export { Label } from "./components/label";
