/// <reference types="node" />
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { CODE_NUMBER, CODE_WORDS, isOneTimeCode, MONEY_MOVED } from "@/lib/capture/one-time-code";

describe("isOneTimeCode", () => {
  it.each([
    "123456 is your OTP for txn of INR 1,249.00 at AMAZON. Valid for 5 mins. Do not share. -HDFC Bank",
    "Your One Time Password for login is 4821. Never share it with anyone.",
    "Use verification code 90311 to sign in to PhonePe",
    "OTP: 772910 for adding beneficiary. ICICI Bank will never call you for OTP.",
    "Your one-time passcode is 558201",
  ])("drops %j", (text) => {
    expect(isOneTimeCode(text)).toBe(true);
  });

  it.each([
    "Rs.249.00 debited from A/c XX1234 on 18-11-26 to VPA bluetokai@okaxis. UPI Ref 432198765012. Never share your OTP. -SBI",
    "INR 50,000.00 credited to your A/c XX9876 on 18/11/26. Avl Bal INR 1,20,450.00",
    "Get 10% cashback on your next 3 UPI payments! T&C apply",
    "Your OTP request could not be processed. Try again later.",
    "Paid ₹1,249 to Blue Tokai Coffee",
  ])("keeps %j", (text) => {
    expect(isOneTimeCode(text)).toBe(false);
  });
});

describe("the copies elsewhere", () => {
  const read = (path: string) =>
    readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

  it("match the API's patterns", () => {
    const api = read("../../../api/src/capture/one-time-code.ts");
    for (const pattern of [CODE_WORDS, CODE_NUMBER, MONEY_MOVED]) {
      expect(api).toContain(`/${pattern.source}/`);
    }
  });

  it("match the patterns the Android capture code runs", () => {
    const kotlin = read("../../android/app/src/main/java/com/penny/mobile/capture/OneTimeCode.kt");
    for (const pattern of [CODE_WORDS, CODE_NUMBER, MONEY_MOVED]) {
      expect(kotlin).toContain(`"""${pattern.source}"""`);
    }
  });
});
