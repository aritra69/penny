import { describe, expect, it } from "vitest";

import { FINANCE_APPS, FINANCE_APP_IDS, matchInstalled } from "@/lib/finance-apps/catalogue";

describe("finance app catalogue", () => {
  it("has no duplicate package names", () => {
    expect(new Set(FINANCE_APP_IDS).size).toBe(FINANCE_APP_IDS.length);
  });

  it("uses well-formed Android package names", () => {
    for (const app of FINANCE_APPS) {
      expect(app.id).toMatch(/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/);
      expect(app.name.trim()).toBe(app.name);
      expect(app.name).not.toBe("");
    }
  });
});

describe("matchInstalled", () => {
  it("returns nothing when no known app is installed", () => {
    expect(matchInstalled([])).toEqual([]);
    expect(matchInstalled(["com.whatsapp", "com.google.android.gm"])).toEqual([]);
  });

  it("leaves out apps Penny doesn't know", () => {
    const rows = matchInstalled(["com.whatsapp", "com.phonepe.app"]);
    expect(rows.map((row) => row.id)).toEqual(["com.phonepe.app"]);
  });

  it("orders banks, then UPI, then investments, then mostly-offers apps", () => {
    const rows = matchInstalled([
      "com.dreamplug.androidapp",
      "com.nextbillion.groww",
      "com.phonepe.app",
      "com.sbi.lotusintouch",
      "com.hdfcbank.android.now",
    ]);
    expect(rows.map((row) => row.name)).toEqual([
      "HDFC Bank",
      "YONO SBI",
      "PhonePe",
      "Groww",
      "CRED",
    ]);
    expect(rows.map((row) => row.note)).toEqual([
      "Bank",
      "Bank",
      "UPI",
      "Investments",
      "Mostly offers",
    ]);
  });

  it("suggests everything except the mostly-offers apps", () => {
    const rows = matchInstalled(["com.dreamplug.androidapp", "com.phonepe.app"]);
    expect(rows.find((row) => row.name === "PhonePe")?.suggested).toBe(true);
    expect(rows.find((row) => row.name === "CRED")?.suggested).toBe(false);
  });

  it("ignores a package listed twice", () => {
    expect(matchInstalled(["com.phonepe.app", "com.phonepe.app"])).toHaveLength(1);
  });
});
