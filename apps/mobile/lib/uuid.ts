/**
 * A random (version 4) UUID. Hermes has no `crypto.randomUUID`, so it is built from
 * `crypto.getRandomValues`, which `react-native-get-random-values` provides (imported in index.js).
 */
/* eslint-disable no-bitwise -- setting the version and variant bits */
export function randomUUID(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
