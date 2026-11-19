import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeDevice } from "@/lib/device/fake";
import type { ImportProgress } from "@/lib/device/types";

describe("fake device", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("unlocks SMS in the order Android does", async () => {
    const device = createFakeDevice();
    expect((await device.getPermissions()).sms).toBe("restricted");

    // Asking before "Allow restricted settings" is on changes nothing.
    const early = device.requestSmsAccess();
    await vi.runAllTimersAsync();
    expect((await early).sms).toBe("restricted");

    const unlocked = device.openAppInfo();
    await vi.runAllTimersAsync();
    expect((await unlocked).sms).toBe("not-allowed");

    const allowed = device.requestSmsAccess();
    await vi.runAllTimersAsync();
    expect((await allowed).sms).toBe("allowed");
  });

  it("reports import progress up to done, and stops when cancelled", async () => {
    const device = createFakeDevice();
    const seen: ImportProgress[] = [];
    device.importHistory(6, (p) => seen.push(p));
    await vi.runAllTimersAsync();

    const last = seen.at(-1)!;
    expect(seen[0]!.fraction).toBe(0);
    expect(last).toMatchObject({ fraction: 1, done: true, messagesRead: 1722 });
    expect(seen.some((p) => p.messagesRead === 1240 && p.transactionsFound === 312)).toBe(true);

    const cancelled: ImportProgress[] = [];
    const run = device.importHistory(6, (p) => cancelled.push(p));
    run.cancel();
    await vi.runAllTimersAsync();
    expect(cancelled).toHaveLength(1);
  });
});
