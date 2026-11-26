import { createAndroidDevice } from "@/lib/device/android";
import { createFakeDevice } from "@/lib/device/fake";
import type { PennyDevice } from "@/lib/device/types";

export type * from "@/lib/device/types";

/**
 * The phone, as the app sees it. On Android, finance app detection and the permissions are real
 * (`android.ts`); found accounts, the history import and budget suggestions are still the fake's
 * sample data, as is everything on iOS. Screens only know `PennyDevice`.
 */
export const device: PennyDevice = createAndroidDevice(createFakeDevice());
