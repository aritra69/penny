/**
 * Sending queued messages to the API. Plain logic, so it runs under Vitest; `sync.ts` plugs in
 * the native queue and `fetch`.
 */

/** The body of `POST /captures`: one message as the phone received it. */
export type CapturePayload = {
  source: "sms" | "notification";
  /** SMS sender ID (e.g. AX-HDFCBK) or the app's package name. */
  sender: string;
  title: string | null;
  text: string;
  /** ISO 8601, UTC. */
  receivedAt: string;
};

export type QueuedCapture = CapturePayload & { id: string };

export type CaptureQueue = {
  peek(limit: number): Promise<QueuedCapture[]>;
  remove(ids: string[]): Promise<void>;
};

/** What to do with a message after the API answered with `status`. */
export type Verdict = "sent" | "rejected" | "retry";

export function verdictFor(status: number): Verdict {
  if (status >= 200 && status < 300) return "sent";
  // The message itself is bad (malformed, too long): sending it again can't help.
  if (status === 400 || status === 413 || status === 422) return "rejected";
  // Signed out (401), rate limited (429), server down or not set up (5xx): try again later.
  return "retry";
}

export type DrainResult = {
  sent: number;
  rejected: number;
  /** "empty": the queue is drained. "retry": stopped early; the rest waits for the next run. */
  stopped: "empty" | "retry";
};

/**
 * Sends queued messages oldest first, one at a time, removing each once the API has it. Stops
 * at the first one that has to wait (offline, signed out, server trouble), keeping it and
 * everything after it queued.
 */
export async function drainQueue(
  queue: CaptureQueue,
  post: (capture: CapturePayload) => Promise<number>,
  batchSize = 20,
): Promise<DrainResult> {
  const result: DrainResult = { sent: 0, rejected: 0, stopped: "empty" };
  for (;;) {
    const batch = await queue.peek(batchSize);
    if (!batch.length) return result;
    for (const { id, ...capture } of batch) {
      let verdict: Verdict;
      try {
        verdict = verdictFor(await post(capture));
      } catch {
        verdict = "retry"; // No network, or the request failed on the way.
      }
      if (verdict === "retry") return { ...result, stopped: "retry" };
      result[verdict] += 1;
      await queue.remove([id]);
    }
  }
}
