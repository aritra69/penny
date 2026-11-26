import { NativeModules, Platform } from "react-native";

import type { QueuedCapture } from "@/lib/capture/drain";

/**
 * Penny's own Android module (`android/app/src/main/java/com/penny/mobile/device`). Reached only
 * through `lib/device` and `lib/capture`, never from screens.
 */
export type PennyDeviceModule = {
  /** Which of `candidates` (package names) are installed. */
  getInstalledPackages(candidates: string[]): Promise<string[]>;
  getStatus(): Promise<{
    notificationAccess: boolean;
    /** Android is holding back restricted settings until "Allow restricted settings" is on. */
    restrictedSettings: boolean;
    batteryUnrestricted: boolean;
  }>;
  /** Each resolves whether a settings screen (or prompt) opened. */
  openNotificationAccessSettings(): Promise<boolean>;
  openAppInfo(): Promise<boolean>;
  requestUnrestrictedBattery(): Promise<boolean>;

  /**
   * The finance apps (package names) and "sms" to read, for the signed-in account `owner`. A new
   * owner empties the queue, so one account's messages are never sent as another's.
   */
  setSources(ids: string[], owner: string | null): Promise<void>;
  peekCaptures(limit: number): Promise<QueuedCapture[]>;
  removeCaptures(ids: string[]): Promise<void>;
};

/** Null on iOS, where none of this exists. */
export const pennyDevice: PennyDeviceModule | null =
  Platform.OS === "android" ? (NativeModules.PennyDevice ?? null) : null;
