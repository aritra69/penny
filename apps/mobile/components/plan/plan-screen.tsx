import { ScrollView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** The frame of the plan screens after setup: a header, scrolling content, buttons at the bottom. */
export function PlanScreen({
  header,
  children,
  footer,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" />
      {header}
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        contentContainerStyle={{ paddingBottom: footer ? 24 : Math.max(32, insets.bottom + 12) }}
      >
        {children}
      </ScrollView>
      {footer ? (
        <View
          className="gap-3 px-gutter pt-2"
          style={{ paddingBottom: Math.max(28, insets.bottom + 12) }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
