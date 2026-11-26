import { Alert, Linking } from "react-native";

import type { Plan } from "@/lib/onboarding/state";
import { PLAN_NAMES, planPrice } from "@/lib/plans";

/**
 * STUB. Buying and restoring plans.
 *
 * Penny bills through Google Play: Penny Plus is a Play subscription with a one-month free trial
 * (₹149 a month after it), and the own-key plan is a one-time Play product (₹999). Google Play
 * Billing isn't wired up yet, so each call asks the person testing which outcome to pretend, and
 * nothing is charged. A later step replaces these bodies with Play Billing (a library such as
 * react-native-iap) and checks purchases on the server; screens only use the results.
 */

export type PurchaseResult = "purchased" | "failed" | "cancelled";

/** Play's own subscriptions page for Penny: where people cancel or change Penny Plus. */
const PLAY_SUBSCRIPTIONS_URL =
  "https://play.google.com/store/account/subscriptions?package=com.penny.mobile";

function pretend<T>(
  title: string,
  message: string,
  outcomes: { text: string; value: T }[],
  dismissed: T,
): Promise<T> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        ...outcomes.map(({ text, value }) => ({ text, onPress: () => resolve(value) })),
        // Android shows at most three buttons; with three outcomes, tapping outside cancels.
        ...(outcomes.length < 3
          ? [{ text: "Cancel", style: "cancel" as const, onPress: () => resolve(dismissed) }]
          : []),
      ],
      { cancelable: true, onDismiss: () => resolve(dismissed) },
    );
  });
}

/**
 * Buys a plan. For Penny Plus this starts the free month: Play takes no money today and charges
 * the monthly price when the month ends, unless the subscription is cancelled first.
 */
export function purchasePlan(plan: Plan): Promise<PurchaseResult> {
  const what =
    plan === "subscription"
      ? `starting ${PLAN_NAMES.subscription}'s free month (then ${planPrice(plan)})`
      : `paying ${planPrice(plan)} for your own key`;
  return pretend<PurchaseResult>(
    "Test purchase",
    `Google Play billing isn't set up yet, so nothing is charged. Choose how ${what} should turn out.`,
    [
      { text: "Purchase succeeds", value: "purchased" },
      { text: "Purchase fails", value: "failed" },
    ],
    "cancelled",
  );
}

/** What restoring found: the plan already bought on this Google account, or nothing. */
export type RestoreResult = Plan | "none" | "cancelled";

/** Looks for a plan bought earlier on this Google account. */
export function restorePurchases(): Promise<RestoreResult> {
  return pretend<RestoreResult>(
    "Test restore",
    "Google Play billing isn't set up yet. Choose what restoring should find.",
    [
      { text: PLAN_NAMES.subscription, value: "subscription" },
      { text: PLAN_NAMES["own-key"], value: "own-key" },
      { text: "Nothing to restore", value: "none" },
    ],
    "cancelled",
  );
}

/**
 * Opens Google Play's subscriptions page. Apps can't cancel a Play subscription themselves, so
 * "Cancel free trial" and "Manage in Google Play" both land here.
 */
export function openPlaySubscriptions(): Promise<void> {
  return Linking.openURL(PLAY_SUBSCRIPTIONS_URL);
}
