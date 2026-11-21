import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  initialOnboardingState,
  parseOnboardingState,
  type OnboardingState,
} from "@/lib/onboarding/state";

/**
 * Where onboarding progress is kept. One small JSON value per account, on this phone only.
 * SecureStore is used because it is already here; move this to the account on the server once
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
    setLoaded((current) => {
      if (!current.userId) return current;
      const state = next(current.state);
      return state === current.state ? current : { ...current, state, dirty: true };
    });
  }, []);

  // Stable, so screens can call them from effects.
  const update = useCallback(
    (patch: Partial<OnboardingState>) =>
      change((state) => {
        const keys = Object.keys(patch) as (keyof OnboardingState)[];
        return keys.every((key) => Object.is(state[key], patch[key]))
          ? state
          : { ...state, ...patch };
      }),
    [change],
  );
  const complete = useCallback(() => update({ completed: true }), [update]);
  const reset = useCallback(() => change(() => initialOnboardingState), [change]);

  // State read for another account (or none) is never shown for this one.
  const current = loaded.userId === userId;
  const value = useMemo<OnboardingContextValue>(
    () => ({
      ready: userId === null || current,
      state: current ? loaded.state : initialOnboardingState,
      update,
      complete,
      reset,
    }),
    [loaded.state, current, userId, update, complete, reset],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return value;
}
