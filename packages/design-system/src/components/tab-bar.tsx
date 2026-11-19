import * as React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMotion } from "../lib/motion";
import { colors } from "../lib/theme";
import { Icon, type IconName } from "./icon";
import { MotiView } from "./motion";

export type TabBarItem = {
  key: string;
  icon: IconName;
  /** Read by screen readers; the bar shows icons only. */
  label: string;
};

type TabBarProps = {
  items: TabBarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
};

/** Penny's five destinations, in order. */
export const PENNY_TABS: TabBarItem[] = [
  { key: "home", icon: "home", label: "Home" },
  { key: "spending", icon: "spending", label: "Spending" },
  { key: "goals", icon: "goals", label: "Goals" },
  { key: "wealth", icon: "wealth", label: "Wealth" },
  { key: "ask", icon: "chat", label: "Ask Penny" },
];

/**
 * The black bottom bar. White line icons; the current tab gets a highlighter dot under it,
 * the one place the accent appears on every screen.
 */
export function TabBar({ items, activeKey, onSelect }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      role="tablist"
      aria-label="Main"
      className="flex-row bg-primary px-2 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 22) }}
    >
      {items.map((item) => (
        <TabBarButton
          key={item.key}
          item={item}
          active={item.key === activeKey}
          onPress={() => onSelect(item.key)}
        />
      ))}
    </View>
  );
}

function TabBarButton({
  item,
  active,
  onPress,
}: {
  item: TabBarItem;
  active: boolean;
  onPress: () => void;
}) {
  const motion = useMotion();
  return (
    <Pressable
      role="tab"
      aria-selected={active}
      aria-label={item.label}
      onPress={onPress}
      className="min-h-12 flex-1 items-center justify-center gap-[7px]"
    >
      <Icon name={item.icon} size={26} color={colors.paper} />
      <MotiView
        aria-hidden
        animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={motion.select}
        className="h-[7px] w-[7px] rounded-full bg-highlight"
      />
    </Pressable>
  );
}
