import * as SecureStorage from "@/lib/secure-storage";

/**
 * The user's OpenAI key, encrypted on this phone (Android Keystore / iOS Keychain).
 * It is never logged, never sent to Penny's API, and kept out of device backups and transfers.
 */
const KEY_NAME = "penny.openai-key";

export const saveOpenAIKey = (key: string) =>
  SecureStorage.setItem(KEY_NAME, key.trim(), {
    accessible: SecureStorage.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

export const getOpenAIKey = () => SecureStorage.getItem(KEY_NAME);

export const deleteOpenAIKey = () => SecureStorage.deleteItem(KEY_NAME);
