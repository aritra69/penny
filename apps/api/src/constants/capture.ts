import { AGENT_MODEL } from "./agent.ts";

/** Reads bank SMS and payment-app notifications into transactions. */
export const CAPTURE_MODEL = AGENT_MODEL;
export const CAPTURE_PROMPT_CACHE_KEY = "penny-capture";

/** At or above this, a payment Penny read is saved; below it, it waits in the Review inbox. */
export const CAPTURE_CONFIDENCE_TO_SAVE = 0.8;

/**
 * Alerts about one payment (the bank's SMS and the UPI app's notification) arrive a little apart
 * and may carry slightly different times. Without a shared reference number they are treated as
 * one when the amount matches within this window.
 */
export const CAPTURE_DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

/** Longest message accepted, in characters. Bank SMS are a few hundred at most. */
export const MAX_CAPTURE_LENGTH = 2000;
/** Longest sender (SMS sender ID or Android package name). */
export const MAX_SENDER_LENGTH = 200;

export const CAPTURE_SOURCES = ["sms", "notification"] as const;
export const CAPTURE_FIELDS = ["source", "sender", "title", "text", "receivedAt"] as const;

/** What a message can be. Only `spent` and `received` become transactions. */
export const CAPTURE_KINDS = ["spent", "received", "offer", "balance", "request", "other"] as const;

/** What Penny did with a message. */
export const CAPTURE_OUTCOMES = ["saved", "review", "duplicate", "ignored"] as const;

export const TRANSACTION_STATUSES = ["confirmed", "needs_review"] as const;
export const TRANSACTION_SOURCES = ["manual", ...CAPTURE_SOURCES] as const;

/** Minor units per major unit for the currencies bank messages in India use. */
export const CURRENCY_DIGITS: Record<string, number> = { INR: 2, USD: 2, EUR: 2, GBP: 2, AED: 2 };

export const CAPTURE_SYSTEM_PROMPT = [
  "You read one SMS or app notification from an Indian bank, card or payment app and describe it.",
  "kind: 'spent' when money left the user's account or card (debit, UPI payment, card purchase,",
  "ATM withdrawal, autopay); 'received' when money came in (credit, refund, salary, UPI received);",
  "'offer' for promotions, cashback offers, loan or card offers and other marketing;",
  "'balance' for balance, statement or due-date reminders where no money moved;",
  "'request' for payment requests or collect requests the user hasn't paid; 'other' for anything else.",
  "amount: the transaction amount exactly as written, digits and an optional decimal point only",
  "(e.g. '1249.50'), never the available balance. null if there is none.",
  "currency: ISO 4217, INR unless the message says otherwise.",
  "counterparty: who was paid or who paid, as a person or business would be named; null if unknown.",
  "accountLast4: the last digits of the user's account or card if shown (XX1234 → '1234').",
  "reference: the UPI ref, UTR, RRN or transaction ID if shown, digits and letters only.",
  "occurredAt: the date and time of the transaction if the message states it, as ISO 8601 with",
  "the +05:30 offset unless another is given; null if not stated.",
  "confidence: 0 to 1, how sure you are of kind, amount and direction together.",
  "reason: one short sentence a person would understand, without repeating the whole message.",
].join(" ");
