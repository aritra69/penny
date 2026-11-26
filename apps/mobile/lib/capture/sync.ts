import { API_URL, authHeaders } from "@/lib/auth/client";
import { drainQueue, type CapturePayload, type DrainResult } from "@/lib/capture/drain";
import { pennyDevice } from "@/lib/native/penny-device";

/** The headless task Android runs to send queued messages (`CaptureSyncService.kt`). */
export const CAPTURE_SYNC_TASK = "PennyCaptureSync";

let running: Promise<DrainResult | null> | null = null;
/** Asked again while a run was going: a message may have been queued after its last look. */
let again = false;

async function post(capture: CapturePayload): Promise<number> {
  const response = await fetch(`${API_URL}/captures`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(capture),
  });
  return response.status;
}

async function run(): Promise<DrainResult | null> {
  const native = pennyDevice;
  if (!native) return null;
  const queue = {
    peek: (limit: number) => native.peekCaptures(limit),
    remove: (ids: string[]) => native.removeCaptures(ids),
  };
  let result: DrainResult | null = null;
  do {
    again = false;
    result = await drainQueue(queue, post).catch(() => null);
  } while (again && result?.stopped === "empty");
  return result;
}

/**
 * Sends the messages the phone has queued to `POST /captures`. The server reads each one, saves
 * the payments it's sure about and puts the rest in Review. Safe to call often: a call while a
 * run is going makes it look once more before finishing. Never throws; anything unsent stays
 * queued for the next run.
 */
export function syncCaptures(): Promise<DrainResult | null> {
  if (running) {
    again = true;
    return running;
  }
  running = run().finally(() => {
    running = null;
  });
  return running;
}

/** Run by Android (headless, possibly with the app closed) when a new message is queued. */
export async function captureSyncTask(): Promise<void> {
  await syncCaptures();
}
