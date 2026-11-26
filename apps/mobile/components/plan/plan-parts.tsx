import { View } from "react-native";

import { cn, Text } from "@repo/design-system";

/** "WHAT IT COSTS": the small capitals over a block on the plan screens. */
export function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      role="heading"
      aria-level={2}
      className="font-sans-bold text-caption uppercase tracking-[0.6px]"
    >
      {children}
    </Text>
  );
}

type Fact = {
  label: string;
  value: string;
  /** Set the value as a figure ("₹999") instead of bold text. */
  figure?: boolean;
};

/** Label and value pairs between rules: a heavy rule on top, light ones between the rows. */
export function FactList({ facts, className }: { facts: Fact[]; className?: string }) {
  return (
    <View className={cn("border-t-1.5 border-foreground", className)}>
      {facts.map((fact) => (
        <View
          key={fact.label}
          className={cn(
            "flex-row items-baseline justify-between gap-3 border-b border-line-muted",
            fact.figure ? "py-3.5" : "py-[13px]",
          )}
        >
          <Text>{fact.label}</Text>
          <Text
            variant={fact.figure ? "figure" : undefined}
            className={fact.figure ? "" : "font-sans-bold"}
          >
            {fact.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * How a Penny notification looks in the Android shade, for screens that show the user the
 * reminder they'll get. Rounded like the system's own cards: it pictures Android, not Penny.
 */
export function NotificationPreview({
  when,
  title,
  body,
  className,
}: {
  when: string;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <View
      aria-label={`Notification preview. ${title}. ${body}`}
      className={cn("flex-row gap-3 rounded-[20px] bg-muted px-4 py-3.5", className)}
    >
      <View
        aria-hidden
        className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary"
      >
        <Text className="font-display text-body-lg text-primary-foreground">P</Text>
      </View>
      <View className="min-w-0 flex-1 gap-[3px]">
        <Text variant="small">Penny · {when}</Text>
        <Text className="font-sans-bold">{title}</Text>
        <Text className="text-label">{body}</Text>
      </View>
    </View>
  );
}
