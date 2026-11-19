import * as React from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";
import { IconButton, type IconButtonProps } from "./icon-button";
import { Input, type InputProps } from "./input";
import { Label } from "./label";
import { Text } from "./text";

type TextFieldProps = InputProps & {
  label: string;
  /** A plain line under the field: "About ₹10,200 a month for 8 months". */
  hint?: string;
  /** Replaces the hint and marks the field invalid. Say what to do: "Enter an email like you@example.com". */
  error?: string;
  /** A button inside the underline: clear, show password. */
  action?: Pick<IconButtonProps, "icon" | "label" | "onPress">;
  containerClassName?: string;
};

/** A labelled input with its hint or error. Labels sit above, always visible; no floating labels. */
export function TextField({
  label,
  hint,
  error,
  action,
  containerClassName,
  className,
  ...inputProps
}: TextFieldProps) {
  const id = React.useId();
  const labelId = `${id}-label`;
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <View className={cn("gap-1", containerClassName)}>
      <Label nativeID={labelId}>{label}</Label>
      <View className="flex-row items-end">
        <Input
          aria-labelledby={labelId}
          aria-describedby={message ? messageId : undefined}
          aria-invalid={!!error}
          className={cn(action && "pr-10", className)}
          {...inputProps}
        />
        {action ? (
          <View className="absolute bottom-1 right-0">
            <IconButton {...action} iconSize={22} className="h-8 w-8" />
          </View>
        ) : null}
      </View>
      {message ? (
        <Text
          nativeID={messageId}
          role={error ? "alert" : undefined}
          variant="caption"
          className={cn("pt-1", error && "text-destructive")}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
