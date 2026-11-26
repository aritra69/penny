import { describe, expect, it } from "vitest";

import {
  drainQueue,
  verdictFor,
  type CapturePayload,
  type QueuedCapture,
} from "@/lib/capture/drain";

const message = (id: string): QueuedCapture => ({
  id,
  source: "notification",
  sender: "com.phonepe.app",
  title: "Paid ₹249",
  text: `to Blue Tokai Coffee (${id})`,
  receivedAt: "2026-11-26T09:30:00.000Z",
});

function memoryQueue(ids: string[]) {
  let items = ids.map(message);
  return {
    peek: async (limit: number) => items.slice(0, limit),
    remove: async (gone: string[]) => {
      items = items.filter((item) => !gone.includes(item.id));
    },
    left: () => items.map((item) => item.id),
  };
}

describe("verdictFor", () => {
  it("keeps what the API should see again later", () => {
    expect(verdictFor(201)).toBe("sent");
    expect(verdictFor(200)).toBe("sent");
    expect(verdictFor(422)).toBe("rejected");
    expect(verdictFor(401)).toBe("retry");
    expect(verdictFor(429)).toBe("retry");
    expect(verdictFor(503)).toBe("retry");
  });
});

describe("drainQueue", () => {
  it("sends everything oldest first, across batches", async () => {
    const queue = memoryQueue(["a", "b", "c", "d", "e"]);
    const posted: CapturePayload[] = [];
    const post = async (capture: CapturePayload) => {
      posted.push(capture);
      return 201;
    };
    const result = await drainQueue(queue, post, 2);

    expect(result).toEqual({ sent: 5, rejected: 0, stopped: "empty" });
    expect(posted.map((c) => c.text.slice(-2, -1))).toEqual(["a", "b", "c", "d", "e"]);
    expect(queue.left()).toEqual([]);
    // The queue's own id isn't part of the API's body.
    expect(posted[0]).not.toHaveProperty("id");
  });

  it("stops at the first message that has to wait, keeping it and the rest", async () => {
    const queue = memoryQueue(["a", "b", "c"]);
    const statuses = [201, 503];
    const result = await drainQueue(queue, async () => statuses.shift()!);

    expect(result).toEqual({ sent: 1, rejected: 0, stopped: "retry" });
    expect(queue.left()).toEqual(["b", "c"]);
  });

  it("treats a failed request as offline", async () => {
    const queue = memoryQueue(["a"]);
    const result = await drainQueue(queue, async () => {
      throw new TypeError("Network request failed");
    });
    expect(result.stopped).toBe("retry");
    expect(queue.left()).toEqual(["a"]);
  });

  it("lets go of messages the API will never accept", async () => {
    const queue = memoryQueue(["a", "b"]);
    const result = await drainQueue(queue, async (c) => (c.text.includes("(a)") ? 422 : 201));
    expect(result).toEqual({ sent: 1, rejected: 1, stopped: "empty" });
    expect(queue.left()).toEqual([]);
  });
});
