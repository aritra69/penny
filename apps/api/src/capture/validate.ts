import {
  CAPTURE_FIELDS,
  CAPTURE_SOURCES,
  MAX_CAPTURE_LENGTH,
  MAX_SENDER_LENGTH,
} from "../constants/index.ts";
import type { CaptureInput } from "./capture.ts";

type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };

/** Validates a POST /captures body: one message as the phone received it. */
export function validateCapture(body: unknown): Result<CaptureInput> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, errors: ["body must be a JSON object"] };
  }
  const input = body as Record<string, unknown>;
  const errors: string[] = [];
  const known = new Set<string>(CAPTURE_FIELDS);
  for (const key of Object.keys(input)) {
    if (!known.has(key)) errors.push(`unknown field: ${key}`);
  }

  const { source, sender, title, text, receivedAt } = input;
  if (!CAPTURE_SOURCES.includes(source as CaptureInput["source"])) {
    errors.push(`source must be one of: ${CAPTURE_SOURCES.join(", ")}`);
  }
  if (typeof sender !== "string" || !sender.trim() || sender.length > MAX_SENDER_LENGTH) {
    errors.push(`sender must be a non-empty string of at most ${MAX_SENDER_LENGTH} characters`);
  }
  if (title !== undefined && title !== null && typeof title !== "string") {
    errors.push("title must be a string or null");
  }
  if (typeof text !== "string" || !text.trim()) {
    errors.push("text must be a non-empty string");
  }
  const message = `${typeof title === "string" ? title : ""}${typeof text === "string" ? text : ""}`;
  if (message.length > MAX_CAPTURE_LENGTH) {
    errors.push(`title and text must be at most ${MAX_CAPTURE_LENGTH} characters together`);
  }
  if (typeof receivedAt !== "string" || Number.isNaN(Date.parse(receivedAt))) {
    errors.push("receivedAt must be an ISO 8601 date-time string");
  }

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      source: source as CaptureInput["source"],
      sender: (sender as string).trim(),
      title: typeof title === "string" && title.trim() ? title.trim() : null,
      text: (text as string).trim(),
      receivedAt: new Date(receivedAt as string).toISOString(),
    },
  };
}
