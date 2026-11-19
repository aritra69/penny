/**
 * Everything Penny needs from the phone that JavaScript can't do alone: which finance apps are
 * installed, Android's notification / SMS / battery permissions, the accounts seen in bank SMS,
 * and reading SMS history.
 *
 * Nothing native implements this yet. `fake.ts` returns the design's sample data so the screens
 * work end to end; a real native module replaces it in `index.ts` without touching the screens.
 */

/** An integer in minor units (paise, cents) with its ISO 4217 currency. Negative = money out. */
export type Money = { amount: number; currency: string };

export type DetectedApp = {
  /** Stable id, e.g. the Android package name. */
  id: string;
  name: string;
  /** What the app is, or why it's off: "Bank", "UPI", "Investments", "Mostly offers". */
  note: string;
  /** Whether Penny suggests reading it. The user decides. */
  suggested: boolean;
};

export type DevicePermissions = {
  /** Android notification-listener access. */
  notifications: "allowed" | "not-allowed";
  /**
   * READ_SMS / RECEIVE_SMS. "restricted": Android blocks the request for sideloaded apps until
   * the user turns on "Allow restricted settings" in App info.
   */
  sms: "allowed" | "restricted" | "not-allowed";
  /** Battery optimisation. "optimised" lets Android put Penny to sleep. */
  battery: "unrestricted" | "optimised";
};

export type FoundAccount = {
  id: string;
  /** "HDFC savings ••1234", "yourname@okhdfcbank". */
  label: string;
  kind: "bank" | "card" | "upi";
  /** The latest balance read from an SMS, when there is one. */
  lastBalance?: Money;
  /** Penny saw it only as a counterparty, so it may be someone else's. Off by default. */
  unsure: boolean;
};

export type ImportProgress = {
  /** The period being read, ISO 8601 UTC. */
  from: string;
  to: string;
  /** 0 to 1. */
  fraction: number;
  messagesRead: number;
  transactionsFound: number;
  /** Messages with a one-time code, dropped on the phone and never stored or sent. */
  codesDropped: number;
  done: boolean;
};

export type BudgetSuggestions = {
  currency: string;
  /** One per main category, from the 6-month average rounded up a little. Minor units. */
  categories: { id: string; name: string; average: number; suggested: number }[];
  /** This month's bills from autopays, and how many autopays there are. */
  bills: number;
  autopayCount: number;
  /** Set aside for spending outside the categories above. */
  everythingElse: number;
  /** How much one tap of − or + changes a budget. */
  step: number;
};

export interface PennyDevice {
  /** Banking, UPI and investment apps installed on this phone. */
  detectApps(): Promise<DetectedApp[]>;

  getPermissions(): Promise<DevicePermissions>;
  /** Opens Android's notification-access settings; resolves when the user comes back. */
  requestNotificationAccess(): Promise<DevicePermissions>;
  /** Opens Penny's App info, where "Allow restricted settings" lives; resolves on return. */
  openAppInfo(): Promise<DevicePermissions>;
  /** Shows Android's SMS permission prompt. */
  requestSmsAccess(): Promise<DevicePermissions>;
  /** Asks Android to stop battery-optimising Penny. */
  requestUnrestrictedBattery(): Promise<DevicePermissions>;

  /** Bank accounts, cards and UPI IDs seen in the bank SMS on this phone. */
  findAccounts(): Promise<FoundAccount[]>;

  /**
   * Reads the last `months` of bank SMS, reporting as it goes. It carries on in the background
   * after the screen closes; `cancel` stops it.
   */
  importHistory(months: number, onProgress: (progress: ImportProgress) => void): { cancel(): void };

  /** Starting budgets worked out from the imported history. */
  suggestBudgets(): Promise<BudgetSuggestions>;
}
