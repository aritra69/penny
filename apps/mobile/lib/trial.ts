/**
 * The free month: its length, its dates and how they read. Plain logic, no React Native, so it
 * runs under Vitest. Dates are stored as ISO 8601 UTC and shown in the phone's time zone.
 */

/** Penny Plus starts with this many free days. */
export const TRIAL_DAYS = 30;

/** The reminder goes out this many days before the free month ends (day 28 of 30). */
export const REMINDER_DAYS_BEFORE_END = 2;

/** The reminder's local time of day: 9:30 in the morning. */
export const REMINDER_HOUR = 9;
export const REMINDER_MINUTE = 30;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The same local time of day, `days` calendar days later. */
function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export type TrialDates = {
  /** When the free month started. */
  startedAt: string;
  /** When it ends and Penny Plus starts charging. */
  endsAt: string;
};

/** The free month that starts at `now`. */
export function trialDates(now: Date): TrialDates {
  return { startedAt: now.toISOString(), endsAt: addDays(now, TRIAL_DAYS).toISOString() };
}

/** When the day-28 reminder goes out: two days before the end, at 9:30 local time. */
export function reminderDate(endsAt: string): Date {
  const date = addDays(new Date(endsAt), -REMINDER_DAYS_BEFORE_END);
  date.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);
  return date;
}

/** Whole days left until `endsAt`, counted by calendar date; 0 on the last day and after. */
export function daysLeft(endsAt: string, now: Date): number {
  const end = new Date(endsAt);
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(end) - startOf(now)) / 86_400_000);
  return Math.max(0, days);
}

/** "23 Dec". */
export function formatDay(date: Date | string): string {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "23 Dec 2026". */
export function formatFullDate(date: Date | string): string {
  return `${formatDay(date)} ${new Date(date).getFullYear()}`;
}

/** "Wed 23 Dec". */
export function formatWeekdayDay(date: Date | string): string {
  return `${WEEKDAYS[new Date(date).getDay()]} ${formatDay(date)}`;
}

/** "2 days", "1 day". */
export function formatDays(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

/**
 * The day-28 notification. `priceLabel` is the formatted price ("₹149 a month"); the counts are
 * left out until Penny has them.
 */
export function trialReminderCopy({
  endsAt,
  priceLabel,
  sorted,
  bills,
}: {
  endsAt: string;
  priceLabel: string;
  sorted?: number;
  bills?: number;
}): { title: string; body: string; actions: [string, string] } {
  const done: string[] = [];
  if (sorted !== undefined) done.push(`sorted ${sorted} ${sorted === 1 ? "message" : "messages"}`);
  if (bills !== undefined) done.push(`caught ${bills} ${bills === 1 ? "bill" : "bills"}`);
  const month = done.length ? `This month Penny ${done.join(" and ")}. ` : "";
  return {
    title: `Your free month ends in ${formatDays(REMINDER_DAYS_BEFORE_END)}`,
    body: `${month}Plus starts on ${formatWeekdayDay(endsAt)} at ${priceLabel}.`,
    actions: ["Keep Plus", "See options"],
  };
}
