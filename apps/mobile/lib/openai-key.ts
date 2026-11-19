import * as SecureStore from "expo-secure-store";

/**
 * The user's OpenAI key, encrypted on this phone (Android Keystore / iOS Keychain).
 * It is never logged, never sent to Penny's API, and kept out of device backups and transfers.
 */
const KEY_NAME = "penny.openai-key";

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const saveOpenAIKey = (key: string) =>
  SecureStore.setItemAsync(KEY_NAME, key.trim(), OPTIONS);

export const getOpenAIKey = () => SecureStore.getItemAsync(KEY_NAME, OPTIONS);

export const deleteOpenAIKey = () => SecureStore.deleteItemAsync(KEY_NAME, OPTIONS);
