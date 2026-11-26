import * as Keychain from "react-native-keychain";

/**
 * Small string values encrypted on this phone: Android Keystore (AES-GCM) / iOS Keychain.
 * One Keychain "service" per key. Kept out of device backups (`allowBackup="false"`) and, with
 * the `*_THIS_DEVICE_ONLY` accessibility, out of transfers to a new iPhone.
 */
export type SecureStorageOptions = {
  /** iOS: when the value can be read. Defaults to after the first unlock since boot. */
  accessible?: Keychain.ACCESSIBLE;
};

export async function getItem(key: string): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({ service: key });
  return credentials ? credentials.password : null;
}

export async function setItem(
  key: string,
  value: string,
  {
    accessible = Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  }: SecureStorageOptions = {},
): Promise<void> {
  const saved = await Keychain.setGenericPassword(key, value, {
    service: key,
    accessible,
    storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
  });
  if (!saved) throw new Error(`Couldn't save "${key}" to secure storage`);
}

export async function deleteItem(key: string): Promise<void> {
  await Keychain.resetGenericPassword({ service: key });
}

export const ACCESSIBLE = Keychain.ACCESSIBLE;
