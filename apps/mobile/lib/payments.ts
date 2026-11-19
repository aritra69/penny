import { Alert } from "react-native";

import type { Plan } from "@/lib/onboarding/state";

export type PaymentResult = "paid" | "failed" | "cancelled";

/**
 * STUB. Takes payment for a plan. There is no store or payment provider yet, so this asks the
 * person testing which outcome to pretend: nothing is charged. Replace the body with the real
 * purchase flow; screens only use the result.
 */
export function requestPayment(plan: Plan, priceLabel: string): Promise<PaymentResult> {
  const what = plan === "subscription" ? "the subscription" : "your own key";
  return new Promise((resolve) => {
    Alert.alert(
      "Test payment",
      `No payment is set up yet. Choose how paying ${priceLabel} for ${what} should turn out.`,
      [
        { text: "Payment succeeds", onPress: () => resolve("paid") },
        { text: "Payment fails", onPress: () => resolve("failed") },
        { text: "Cancel", style: "cancel", onPress: () => resolve("cancelled") },
      ],
      { cancelable: true, onDismiss: () => resolve("cancelled") },
    );
  });
}
