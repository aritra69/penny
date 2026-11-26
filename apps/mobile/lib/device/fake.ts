import type {
  BudgetSuggestions,
  DetectedApp,
  DevicePermissions,
  FoundAccount,
  ImportProgress,
  PennyDevice,
} from "@/lib/device/types";
import { matchInstalled } from "@/lib/finance-apps/catalogue";

/**
 * STUB. Stands in for the parts of the native module that don't exist yet, and for all of it on
 * iOS. It reads nothing from the phone and asks Android for nothing: every value below is sample
 * data from the design canvas.
 */

const rupees = (amount: number) => amount * 100;

/** The six apps on the design's "Which apps can Penny read?" screen. */
const APPS: DetectedApp[] = matchInstalled([
  "com.hdfcbank.android.now",
  "com.sbi.lotusintouch",
  "com.google.android.apps.nbu.paisa.user",
  "com.phonepe.app",
  "com.nextbillion.groww",
  "com.dreamplug.androidapp",
]);

const ACCOUNTS: FoundAccount[] = [
  {
    id: "hdfc-savings-1234",
    label: "HDFC savings ••1234",
    kind: "bank",
    lastBalance: { amount: rupees(62_410), currency: "INR" },
    unsure: false,
  },
  {
    id: "sbi-savings-5678",
    label: "SBI savings ••5678",
    kind: "bank",
    lastBalance: { amount: rupees(118_900), currency: "INR" },
    unsure: false,
  },
  { id: "hdfc-card-9012", label: "HDFC credit card ••9012", kind: "card", unsure: false },
  { id: "upi-okhdfcbank", label: "yourname@okhdfcbank", kind: "upi", unsure: false },
  { id: "upi-ybl", label: "98xxxxxx10@ybl", kind: "upi", unsure: true },
];

const BUDGETS: BudgetSuggestions = {
  currency: "INR",
  categories: [
    { id: "food", name: "Food & dining", average: rupees(7_300), suggested: rupees(8_000) },
    { id: "groceries", name: "Groceries", average: rupees(5_600), suggested: rupees(6_000) },
    { id: "travel", name: "Travel", average: rupees(2_700), suggested: rupees(3_000) },
    { id: "shopping", name: "Shopping", average: rupees(4_400), suggested: rupees(5_000) },
    { id: "fuel", name: "Fuel", average: rupees(2_600), suggested: rupees(3_000) },
  ],
  bills: rupees(9_000),
  autopayCount: 6,
  everythingElse: rupees(6_000),
  step: rupees(500),
};

/** Totals chosen so the import passes through the design's frame: 72%, 1,240 / 312 / 86. */
const IMPORT_TOTAL = { messages: 1722, transactions: 433, codes: 119 };
const IMPORT_TICK_MS = 280;
const IMPORT_TICK_PERCENT = 4;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function createFakeDevice(): PennyDevice {
  // Starts where the design's permissions screen does: notifications on, SMS locked, battery not fixed.
  let permissions: DevicePermissions = {
    notifications: "allowed",
    sms: "restricted",
    battery: "optimised",
  };

  const change = async (patch: Partial<DevicePermissions>) => {
    await wait(250);
    permissions = { ...permissions, ...patch };
    return permissions;
  };

  return {
    detectApps: async () => APPS,

    getPermissions: async () => permissions,
    requestNotificationAccess: () => change({ notifications: "allowed" }),
    // Pretends the user turned on "Allow restricted settings" and came back.
    openAppInfo: () => change(permissions.sms === "restricted" ? { sms: "not-allowed" } : {}),
    requestSmsAccess: () => change(permissions.sms === "not-allowed" ? { sms: "allowed" } : {}),
    requestUnrestrictedBattery: () => change({ battery: "unrestricted" }),

    findAccounts: async () => ACCOUNTS,

    importHistory(months, onProgress) {
      const to = new Date();
      const from = new Date(to);
      from.setUTCMonth(from.getUTCMonth() - months);

      let percent = 0;
      const report = () => {
        const fraction = percent / 100;
        const progress: ImportProgress = {
          from: from.toISOString(),
          to: to.toISOString(),
          fraction,
          messagesRead: Math.round(IMPORT_TOTAL.messages * fraction),
          transactionsFound: Math.round(IMPORT_TOTAL.transactions * fraction),
          codesDropped: Math.round(IMPORT_TOTAL.codes * fraction),
          done: percent >= 100,
        };
        onProgress(progress);
      };

      report();
      const timer = setInterval(() => {
        percent = Math.min(100, percent + IMPORT_TICK_PERCENT);
        report();
        if (percent >= 100) clearInterval(timer);
      }, IMPORT_TICK_MS);

      return { cancel: () => clearInterval(timer) };
    },

    suggestBudgets: async () => BUDGETS,
  };
}
