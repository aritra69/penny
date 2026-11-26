import { AppState, PermissionsAndroid } from "react-native";

import type { DevicePermissions, PennyDevice } from "@/lib/device/types";
import { FINANCE_APP_IDS, matchInstalled } from "@/lib/finance-apps/catalogue";
import { pennyDevice } from "@/lib/native/penny-device";

const SMS_PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
  PermissionsAndroid.PERMISSIONS.READ_SMS,
];

/**
 * Resolves when the user is back in Penny after a settings screen or system prompt. Listen
 * before opening it: it waits to see Penny leave the front, then come back.
 */
function waitForReturn() {
  let away = false;
  let done: () => void = () => {};
  const back = new Promise<void>((resolve) => (done = resolve));
  const leave = () => (away = true);
  const arrive = () => {
    if (away) finish();
  };
  const subscriptions = [
    AppState.addEventListener("change", (state) => (state === "active" ? arrive() : leave())),
    // Android: prompts drawn over Penny only take focus; they don't send it to the background.
    AppState.addEventListener("blur", leave),
    AppState.addEventListener("focus", arrive),
  ];
  function finish() {
    subscriptions.forEach((subscription) => subscription.remove());
    done();
  }
  return { back, cancel: finish };
}

/**
 * The real phone on Android, through Penny's native module: finance app detection, the
 * notification / SMS / battery permissions, and the settings screens behind them. Accounts,
 * the history import and budgets still come from `fallback`.
 *
 * Returns `fallback` unchanged where the native module isn't there (iOS).
 */
export function createAndroidDevice(fallback: PennyDevice): PennyDevice {
  const native = pennyDevice;
  if (!native) return fallback;

  async function getPermissions(): Promise<DevicePermissions> {
    const [status, ...sms] = await Promise.all([
      native!.getStatus(),
      ...SMS_PERMISSIONS.map((permission) => PermissionsAndroid.check(permission)),
    ]);
    return {
      notifications: status.notificationAccess ? "allowed" : "not-allowed",
      sms: sms.every(Boolean)
        ? "allowed"
        : status.restrictedSettings
          ? "restricted"
          : "not-allowed",
      battery: status.batteryUnrestricted ? "unrestricted" : "optimised",
    };
  }

  /** Opens a settings screen and resolves with the permissions once the user is back. */
  async function openAndWait(open: () => Promise<boolean>): Promise<DevicePermissions> {
    const wait = waitForReturn();
    if (await open().catch(() => false)) await wait.back;
    else wait.cancel();
    return getPermissions();
  }

  return {
    ...fallback,

    detectApps: async () => matchInstalled(await native.getInstalledPackages(FINANCE_APP_IDS)),

    getPermissions,
    requestNotificationAccess: () => openAndWait(native.openNotificationAccessSettings),
    openAppInfo: () => openAndWait(native.openAppInfo),
    async requestSmsAccess() {
      const results = Object.values(await PermissionsAndroid.requestMultiple(SMS_PERMISSIONS));
      // Android no longer shows the prompt once it's been refused for good; the switch is in
      // App info, so take the user there.
      if (results.includes(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
        return openAndWait(native.openAppInfo);
      }
      return getPermissions();
    },
    requestUnrestrictedBattery: () => openAndWait(native.requestUnrestrictedBattery),
  };
}
