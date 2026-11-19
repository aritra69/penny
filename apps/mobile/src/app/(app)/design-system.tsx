import { DesignSystemGallery } from "@repo/design-system/gallery";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Dev-only: every design-system component with example data. */
export default function DesignSystemScreen() {
  const insets = useSafeAreaInsets();
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <DesignSystemGallery />
    </View>
  );
}
