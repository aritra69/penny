import { View } from "react-native";

import { Input, Label, Text } from "@repo/design-system";

type FormFieldProps = React.ComponentProps<typeof Input> & {
  label: string;
  error?: string;
};

export function FormField({ label, error, ref, ...inputProps }: FormFieldProps) {
  return (
    <View className="gap-1.5">
      <Label nativeID={`${label}-label`}>{label}</Label>
      <Input
        ref={ref}
        aria-labelledby={`${label}-label`}
        aria-invalid={!!error}
        className={error ? "border-destructive" : undefined}
        {...inputProps}
      />
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
    </View>
  );
}
