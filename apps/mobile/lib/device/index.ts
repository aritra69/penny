import { createFakeDevice } from "@/lib/device/fake";
import type { PennyDevice } from "@/lib/device/types";

export type * from "@/lib/device/types";

/**
 * The phone, as the app sees it. Today this is the fake (sample data, no permissions asked).
 * When the native module exists, build it here instead; screens only know `PennyDevice`.
 */
export const device: PennyDevice = createFakeDevice();
