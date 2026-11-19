/**
 * Money display. Amounts are integers in minor units (paise, cents) with an ISO 4217 currency,
 * negative = money out. Penny writes signs with a real minus and a space: "− ₹386", "+ ₹899".
 */

const MINUS = "−";

export type SignDisplay = "auto" | "always" | "never";

export type FormatMoneyOptions = {
  /** "auto": minus only · "always": minus or plus · "never": no sign. Default "auto". */
  sign?: SignDisplay;
  /** Drop ".00" when the amount is whole. Default true. */
  trimWholeFraction?: boolean;
  locale?: string;
};

/** Locale whose digit grouping suits the currency (lakh/crore grouping for INR). */
function defaultLocale(currency: string) {
  return currency === "INR" ? "en-IN" : "en-US";
}

function fractionDigits(currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions()
    .maximumFractionDigits as number;
}

function withSign(text: string, minor: number, sign: SignDisplay) {
  if (sign === "never" || minor === 0) return text;
  if (minor < 0) return `${MINUS} ${text}`;
  return sign === "always" ? `+ ${text}` : text;
}

/** "₹1,82,400", "− ₹386", "+ $12.50". */
export function formatMoney(minor: number, currency: string, options: FormatMoneyOptions = {}) {
  const { sign = "auto", trimWholeFraction = true } = options;
  const locale = options.locale ?? defaultLocale(currency);
  const digits = fractionDigits(currency, locale);
  const major = Math.abs(minor) / 10 ** digits;
  const whole = Math.abs(minor) % 10 ** digits === 0;
  const shown = trimWholeFraction && whole ? 0 : digits;
  const text = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: shown,
    maximumFractionDigits: shown,
  }).format(major);
  return withSign(text, minor, sign);
}

/** The currency's symbol as the locale writes it ("₹", "$", "€"). */
export function currencySymbol(currency: string, locale = defaultLocale(currency)) {
  const parts = new Intl.NumberFormat(locale, { style: "currency", currency }).formatToParts(0);
  return parts.find((p) => p.type === "currency")?.value ?? currency;
}

const INDIAN_UNITS = [
  { size: 1e7, suffix: "Cr" },
  { size: 1e5, suffix: "L" },
  { size: 1e3, suffix: "k" },
];
const WESTERN_UNITS = [
  { size: 1e9, suffix: "B" },
  { size: 1e6, suffix: "M" },
  { size: 1e3, suffix: "k" },
];

/**
 * Short form for tight spaces such as goal boxes: "₹3L", "₹40k", "₹1.2Cr", "$2.5M".
 * Whole units only below 1,000 ("₹850"). One decimal at most, dropped when it is zero.
 */
export function formatMoneyCompact(
  minor: number,
  currency: string,
  options: Omit<FormatMoneyOptions, "trimWholeFraction"> = {},
) {
  const { sign = "auto" } = options;
  const locale = options.locale ?? defaultLocale(currency);
  const major = Math.abs(minor) / 10 ** fractionDigits(currency, locale);
  const units = currency === "INR" ? INDIAN_UNITS : WESTERN_UNITS;
  const unit = units.find((u) => major >= u.size);
  const symbol = currencySymbol(currency, locale);
  let text: string;
  if (unit) {
    const value = Math.floor((major / unit.size) * 10) / 10;
    text = `${symbol}${value.toLocaleString("en-US", { maximumFractionDigits: 1 })}${unit.suffix}`;
  } else {
    text = `${symbol}${Math.round(major).toLocaleString(locale)}`;
  }
  return withSign(text, minor, sign);
}
