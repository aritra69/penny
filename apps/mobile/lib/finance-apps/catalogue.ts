import type { DetectedApp } from "@/lib/device/types";

/**
 * The finance apps Penny knows how to read, by Android package name. Android has no "finance"
 * category to ask for, so this list is what makes an installed app show up in onboarding.
 *
 * Every id here was checked against its Google Play listing (November 2026). Check a new one the
 * same way before adding it: https://play.google.com/store/apps/details?id=<package>
 */

export type FinanceAppKind = "bank" | "upi" | "investments" | "offers";

export type FinanceApp = {
  /** Android package name. */
  id: string;
  name: string;
  kind: FinanceAppKind;
};

/** What the row says under the name. "offers" apps send mostly promotions, so they start off. */
const NOTES: Record<FinanceAppKind, string> = {
  bank: "Bank",
  upi: "UPI",
  investments: "Investments",
  offers: "Mostly offers",
};

/** The order kinds appear in on screen. */
const KIND_ORDER: FinanceAppKind[] = ["bank", "upi", "investments", "offers"];

export const FINANCE_APPS: FinanceApp[] = [
  // Banks
  { id: "com.hdfcbank.android.now", name: "HDFC Bank", kind: "bank" },
  { id: "com.sbi.lotusintouch", name: "YONO SBI", kind: "bank" },
  { id: "com.sbi.SBIFreedomPlus", name: "YONO Lite SBI", kind: "bank" },
  { id: "com.csam.icici.bank.imobile", name: "ICICI iMobile", kind: "bank" },
  { id: "com.axis.mobile", name: "Axis Mobile", kind: "bank" },
  {
    id: "com.kotak811mobilebankingapp.instantsavingsupiscanandpayrecharge",
    name: "Kotak Bank",
    kind: "bank",
  },
  { id: "com.msf.kbank.mobile", name: "Kotak Bank (old app)", kind: "bank" },
  { id: "com.idfcfirstbank.optimus", name: "IDFC FIRST Bank", kind: "bank" },
  { id: "com.indusind.indie", name: "IndusInd Bank", kind: "bank" },
  { id: "in.irisbyyes.app", name: "IRIS by YES BANK", kind: "bank" },
  { id: "com.bankofbaroda.mconnect", name: "bob World", kind: "bank" },
  { id: "com.Version1", name: "PNB ONE", kind: "bank" },
  { id: "com.canarabank.mobility", name: "Canara ai1", kind: "bank" },
  { id: "com.infrasoft.uboi", name: "Union ease", kind: "bank" },
  { id: "com.boi.ua.android", name: "BOI Mobile", kind: "bank" },
  { id: "com.fedmobile", name: "Federal Bank", kind: "bank" },
  { id: "com.ausmallfinancebank.amb", name: "AU 0101", kind: "bank" },
  { id: "money.jupiter", name: "Jupiter", kind: "bank" },

  // UPI and payments
  { id: "com.google.android.apps.nbu.paisa.user", name: "Google Pay", kind: "upi" },
  { id: "com.phonepe.app", name: "PhonePe", kind: "upi" },
  { id: "net.one97.paytm", name: "Paytm", kind: "upi" },
  { id: "in.org.npci.upiapp", name: "BHIM", kind: "upi" },
  { id: "com.hdfcbank.payzapp", name: "PayZapp", kind: "upi" },
  { id: "com.mobikwik_new", name: "MobiKwik", kind: "upi" },
  { id: "money.super.payments", name: "super.money", kind: "upi" },
  { id: "com.naviapp", name: "Navi", kind: "upi" },
  { id: "indwin.c3.shareapp", name: "slice", kind: "upi" },

  // Investments
  { id: "com.nextbillion.groww", name: "Groww", kind: "investments" },
  { id: "com.zerodha.kite3", name: "Zerodha Kite", kind: "investments" },
  { id: "com.zerodha.coin", name: "Zerodha Coin", kind: "investments" },
  { id: "in.upstox.app", name: "Upstox", kind: "investments" },
  { id: "com.msf.angelmobile", name: "Angel One", kind: "investments" },
  { id: "in.indwealth", name: "INDmoney", kind: "investments" },
  { id: "com.gooogle.android.kuvera.app", name: "Kuvera", kind: "investments" },
  { id: "com.smartspends", name: "ET Money", kind: "investments" },
  { id: "com.paytmmoney", name: "Paytm Money", kind: "investments" },
  { id: "com.fivepaisa.trade", name: "5paisa (old app)", kind: "investments" },
  { id: "com.dhan.live", name: "Dhan", kind: "investments" },

  // Real payment alerts, but far more promotions: shown, and off until the user turns them on.
  { id: "com.dreamplug.androidapp", name: "CRED", kind: "offers" },
  { id: "in.amazon.mShop.android.shopping", name: "Amazon", kind: "offers" },
];

/** Every package name Penny asks the phone about. */
export const FINANCE_APP_IDS: string[] = FINANCE_APPS.map((app) => app.id);

/**
 * The catalogue apps among `installedIds`, as onboarding rows: banks first, then UPI,
 * investments and the mostly-offers apps, each group in catalogue order. Packages Penny doesn't
 * know are left out.
 */
export function matchInstalled(installedIds: readonly string[]): DetectedApp[] {
  const installed = new Set(installedIds);
  return KIND_ORDER.flatMap((kind) =>
    FINANCE_APPS.filter((app) => app.kind === kind && installed.has(app.id)).map((app) => ({
      id: app.id,
      name: app.name,
      note: NOTES[kind],
      suggested: kind !== "offers",
    })),
  );
}
