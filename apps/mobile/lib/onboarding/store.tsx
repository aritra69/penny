import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  initialOnboardingState,
  parseOnboardingState,
  type OnboardingState,
} from "@/lib/onboarding/state";

/**
 * Where onboarding progress is kept. One small JSON value per account, on this phone only.
 * SecureStore is used because it is already here; swap this for the on-device database once
 * Penny has one.
 */
const storageKey = (userId: string) => `penny.onboarding.${userId.replace(/[^\w.-]/g, "_")}`;

type OnboardingContextValue = {
  /** False until the saved state for this account has been read. */
  ready: boolean;
  state: OnboardingState;
  /** Merges a change and saves it. */
  update: (patch: Partial<OnboardingState>) => void;
  /** Marks setup finished; the root layout then shows Home. */
  complete: () => void;
  /** Starts setup again from the first screen (dev tools). */
  reset: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/** `dirty` marks state changed here since it was read, so it needs saving. */
type Loaded = { userId: string | null; state: OnboardingState; dirty: boolean };

export function OnboardingProvider({
  userId,
  children,
}: {
  /** The signed-in account, or null when signed out. */
  userId: string | null;
  children: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState<Loaded>({
    userId: null,
    state: initialOnboardingState,
    dirty: false,
  });

  // Read this account's saved progress when it signs in.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    SecureStore.getItemAsync(storageKey(userId))
      .catch(() => null)
      .then((raw) => {
        if (!cancelled) setLoaded({ userId, state: parseOnboardingState(raw), dirty: false });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Save every change. A failed write only costs the user their place in setup.
  useEffect(() => {
    if (!loaded.userId || !loaded.dirty) return;
    SecureStore.setItemAsync(storageKey(loaded.userId), JSON.stringify(loaded.state)).catch(
      () => {},
    );
  }, [loaded]);

  const change = useCallback((next: (state: OnboardingState) => OnboardingState) => {
    setLoaded((current) =>
      current.userId ? { ...current, state: next(current.state), dirty: true } : current,
    );
  }, []);

  // State read for another account (or none) is never shown for this one.
  const current = loaded.userId === userId;
  const value = useMemo<OnboardingContextValue>(
    () => ({
      ready: userId === null || current,
      state: current ? loaded.state : initialOnboardingState,
      update: (patch) => change((state) => ({ ...state, ...patch })),
      complete: () => change((state) => ({ ...state, completed: true })),
      reset: () => change(() => initialOnboardingState),
    }),
    [loaded.state, current, userId, change],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return value;
}
