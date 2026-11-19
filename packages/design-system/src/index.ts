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
export { Input, inputVariants, type InputProps } from "./components/input";
export { Label } from "./components/label";
export { TextField } from "./components/text-field";
export { AmountField } from "./components/amount-field";
export { Stepper } from "./components/stepper";
export { Checkbox, CheckboxBox, CheckRow } from "./components/checkbox";
export { SelectRow } from "./components/select-row";
export { ChoiceCard, ChoiceGroup, PictureChoice } from "./components/choice-card";
export { LabeledDivider } from "./components/labeled-divider";

// Navigation
export { ScreenHeader } from "./components/screen-header";
export { PENNY_TABS, TabBar, type TabBarItem } from "./components/tab-bar";
export { UnderlineTabs } from "./components/underline-tabs";
export { MonthSwitcher } from "./components/month-switcher";

// Feedback
export { NoticeBar } from "./components/notice-bar";
export { InfoNote } from "./components/info-note";
export { ProgressBar } from "./components/progress-bar";

// Data display
export { Amount, HiddenAmountsProvider, useAmountsHidden } from "./components/amount";
export { BigFigure } from "./components/big-figure";
export { SectionHeader } from "./components/section-header";
export { StatBox } from "./components/stat-box";
export { ListRow } from "./components/list-row";
export { KeyValueRow, SplitStat } from "./components/key-value-row";
export { BudgetRow } from "./components/budget-row";
export { StepList } from "./components/step-list";
export { PaceChart } from "./components/pace-chart";
