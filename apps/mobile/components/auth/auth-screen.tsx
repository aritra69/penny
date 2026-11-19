import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@repo/design-system";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthScreen({ title, subtitle, children, footer }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6"
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2 pb-8">
          <Text variant="h3">{title}</Text>
          <Text variant="muted">{subtitle}</Text>
        </View>
        <View className="gap-4">{children}</View>
        {footer ? <View className="flex-row justify-center pt-6">{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** "or" between the email form and Google. */
export function OrDivider() {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <View className="h-px flex-1 bg-border" />
      <Text variant="muted">or</Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}

/** Error from the server (wrong password, email taken…). */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Text role="alert" className="text-sm text-destructive">
      {message}
    </Text>
  );
}
