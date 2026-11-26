import { DesignSystemGallery } from "@repo/design-system/gallery";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Dev-only (registered only when `__DEV__`): every design-system component with example data. */
export default function DesignSystemScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <DesignSystemGallery />
    </View>
  );
}
