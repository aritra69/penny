import { describe, expect, it } from "vitest";

import {
  daysLeft,
  formatDay,
  formatDays,
  formatFullDate,
  formatWeekdayDay,
  reminderDate,
  trialDates,
  trialReminderCopy,
} from "@/lib/trial";

// Local times, so the tests read the same in any time zone.
const started = new Date(2026, 10, 23, 18, 5); // 23 Nov 2026, 6:05 pm

describe("trialDates", () => {
  it("runs 30 calendar days from the start", () => {
    const { startedAt, endsAt } = trialDates(started);
    expect(new Date(startedAt)).toEqual(started);
    expect(new Date(endsAt)).toEqual(new Date(2026, 11, 23, 18, 5));
  });

  it("stores ISO 8601 UTC", () => {
    expect(trialDates(started).endsAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe("reminderDate", () => {
  it("is day 28, at 9:30 in the morning", () => {
    expect(reminderDate(trialDates(started).endsAt)).toEqual(new Date(2026, 11, 21, 9, 30));
  });
});

describe("daysLeft", () => {
  const { endsAt } = trialDates(started);

  it("counts calendar days to the end", () => {
    expect(daysLeft(endsAt, started)).toBe(30);
    expect(daysLeft(endsAt, new Date(2026, 11, 21, 9, 30))).toBe(2);
    expect(daysLeft(endsAt, new Date(2026, 11, 22, 23, 59))).toBe(1);
  });

  it("never goes below zero", () => {
    expect(daysLeft(endsAt, new Date(2026, 11, 23, 20))).toBe(0);
    expect(daysLeft(endsAt, new Date(2027, 0, 5))).toBe(0);
  });
});

describe("formatting", () => {
  const end = new Date(2026, 11, 23);

  it("writes dates the way the screens do", () => {
    expect(formatDay(end)).toBe("23 Dec");
    expect(formatFullDate(end)).toBe("23 Dec 2026");
    expect(formatWeekdayDay(end)).toBe("Wed 23 Dec");
    expect(formatDay(end.toISOString())).toBe("23 Dec");
  });

  it("pluralises days", () => {
    expect(formatDays(1)).toBe("1 day");
    expect(formatDays(2)).toBe("2 days");
  });
});

describe("trialReminderCopy", () => {
  const { endsAt } = trialDates(started);

  it("says when Plus starts and what it costs", () => {
    expect(trialReminderCopy({ endsAt, priceLabel: "₹149 a month" })).toEqual({
      title: "Your free month ends in 2 days",
      body: "Plus starts on Wed 23 Dec at ₹149 a month.",
      actions: ["Keep Plus", "See options"],
    });
  });

  it("leads with what Penny did when the counts are known", () => {
    expect(
      trialReminderCopy({ endsAt, priceLabel: "₹149 a month", sorted: 412, bills: 3 }).body,
    ).toBe(
      "This month Penny sorted 412 messages and caught 3 bills. Plus starts on Wed 23 Dec at ₹149 a month.",
    );
    expect(trialReminderCopy({ endsAt, priceLabel: "₹149 a month", sorted: 1 }).body).toBe(
      "This month Penny sorted 1 message. Plus starts on Wed 23 Dec at ₹149 a month.",
    );
  });
});
