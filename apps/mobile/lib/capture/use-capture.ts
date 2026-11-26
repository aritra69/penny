import { useEffect } from "react";
import { AppState } from "react-native";

import { syncCaptures } from "@/lib/capture/sync";
import { pennyDevice } from "@/lib/native/penny-device";
import { useOnboarding } from "@/lib/onboarding/store";

/**
 * Debug builds also read notifications posted with `adb shell cmd notification post`, which come
 * from this package, so the whole flow can be tried without a real payment.
 */
const ADB_SHELL = "com.android.shell";

/**
 * Keeps the phone's capture code in step with the app: it reads only the sources the signed-in
 * user picked in onboarding (nothing when signed out), and queued messages are sent when the app
 * opens or comes back to the front. Call once, inside `OnboardingProvider`, once the session is
 * known (a pending session isn't "signed out").
 */
export function useCapture(userId: string | null) {
  const { ready, state } = useOnboarding();
  const picked = userId && ready ? (state.sources ?? []) : [];
  const sources = __DEV__ && userId ? [...picked, ADB_SHELL] : picked;
  const key = sources.join("\n");

  useEffect(() => {
    if (!pennyDevice || (userId && !ready)) return;
    const ids = key ? key.split("\n") : [];
    pennyDevice
      .setSources(ids, userId)
      .then(() => (userId ? syncCaptures() : null))
      .catch(() => {});
  }, [key, userId, ready]);

  useEffect(() => {
    if (!pennyDevice || !userId) return;
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") syncCaptures();
    });
    return () => subscription.remove();
  }, [userId]);
}
