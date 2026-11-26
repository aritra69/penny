import { planPrice } from "@/lib/plans";
import { reminderDate, trialReminderCopy } from "@/lib/trial";

/**
 * The one reminder of the free month: a notification on day 28 at 9:30 in the morning, two days
 * before Penny Plus starts charging. Tapping it opens the trial-ending screen ("trial-ending");
 * "Keep Plus" just dismisses it, "See options" opens the same screen.
 *
 * TODO: schedule it. Penny has no notifications library yet, and the Android notification work
 * is happening separately (see `android/` and `lib/device`). Once it lands, schedule a local
 * notification at `when` with `copy`, cancel it when the plan changes or the trial is cancelled,
 * and pass the month's counts (messages sorted, bills caught) to `trialReminderCopy`.
 */
export function trialReminder(trialEndsAt: string) {
  return {
    when: reminderDate(trialEndsAt),
    copy: trialReminderCopy({ endsAt: trialEndsAt, priceLabel: planPrice("subscription") }),
  };
}

/**
 * Schedules the day-28 reminder. Until notifications are set up (see above) it only logs what it
 * would schedule, in development.
 */
export function scheduleTrialReminder(trialEndsAt: string): void {
  const { when, copy } = trialReminder(trialEndsAt);
  if (__DEV__) console.info(`TODO: schedule "${copy.title}" for ${when.toISOString()}`);
}
