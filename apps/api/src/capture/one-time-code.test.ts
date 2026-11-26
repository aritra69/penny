import { describe, expect, test } from "bun:test";
import { isOneTimeCode } from "./one-time-code.ts";

describe("isOneTimeCode", () => {
  test.each([
    "123456 is your OTP for txn of INR 1,249.00 at AMAZON. Valid for 5 mins. Do not share. -HDFC Bank",
    "Your One Time Password for login is 4821. Never share it with anyone.",
    "Use verification code 90311 to sign in to PhonePe",
    "OTP: 772910 for adding beneficiary. ICICI Bank will never call you for OTP.",
  ])("drops %p", (text) => {
    expect(isOneTimeCode(text)).toBe(true);
  });

  test.each([
    "Rs.249.00 debited from A/c XX1234 on 18-11-26 to VPA bluetokai@okaxis. UPI Ref 432198765012. Never share your OTP. -SBI",
    "INR 50,000.00 credited to your A/c XX9876 on 18/11/26. Avl Bal INR 1,20,450.00",
    "Get 10% cashback on your next 3 UPI payments! T&C apply",
    "Your OTP request could not be processed. Try again later.",
  ])("keeps %p", (text) => {
    expect(isOneTimeCode(text)).toBe(false);
  });
});
