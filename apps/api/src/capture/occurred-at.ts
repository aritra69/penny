/** Bank messages in India state dates and times in IST. */
const IST_OFFSET = "+05:30";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * When a captured payment happened, as ISO 8601 in UTC, from the date and time the message
 * states (read as IST) and when the phone received it.
 *
 * - Date and time stated: that moment.
 * - Date only (many bank SMS: "on 18Nov26"): the arrival time if it arrived that day, so it still
 *   matches the UPI app's alert for the same payment; otherwise noon IST of that day.
 * - Nothing stated or nothing readable: the arrival time.
 */
export function resolveOccurredAt(
  date: string | null,
  time: string | null,
  receivedAt: string,
): string {
  const arrived = new Date(receivedAt).toISOString();
  if (!date || !DATE.test(date)) return arrived;

  if (time && TIME.test(time)) {
    const at = Date.parse(`${date}T${time}:00${IST_OFFSET}`);
    if (!Number.isNaN(at)) return new Date(at).toISOString();
  }

  const arrivedDayInIst = new Date(Date.parse(arrived) + IST_OFFSET_MS).toISOString().slice(0, 10);
  if (arrivedDayInIst === date) return arrived;
  const noon = Date.parse(`${date}T12:00:00${IST_OFFSET}`);
  return Number.isNaN(noon) ? arrived : new Date(noon).toISOString();
}
