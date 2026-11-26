import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from "node:crypto";

/**
 * Encrypts the money fields before they reach the database, so a copy of the database alone
 * (a backup, a dump, a leaked disk) shows no amounts, merchants or notes.
 *
 * AES-256-GCM. Each user gets their own key, derived from the master key and their ID, and each
 * value is bound to the user it belongs to: a value copied into another user's row won't open.
 * The API holds the master key, so the running server can read the data; the database can't.
 */

const VERSION = "v1";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const MIN_KEY_BYTES = 32;

export type Vault = {
  seal(userId: string, value: string): string;
  /** Throws if the value was changed, belongs to another user, or was sealed with another key. */
  open(userId: string, sealed: string): string;
  /**
   * A keyed hash of `value` for this user: the same input always gives the same output, so it can
   * be looked up, but it can't be reversed without the master key or matched across users.
   */
  fingerprint(userId: string, value: string): string;
};

/** `masterKey`: at least 32 random bytes, base64 (`openssl rand -base64 32`). */
export function createVault(masterKey: string): Vault {
  const master = Buffer.from(masterKey, "base64");
  if (master.length < MIN_KEY_BYTES) {
    throw new Error("DATA_ENCRYPTION_KEY must be at least 32 random bytes, base64-encoded");
  }

  const keys = new Map<string, Buffer>();
  const derive = (info: string, userId: string) => {
    const cacheKey = `${info}:${userId}`;
    let key = keys.get(cacheKey);
    if (!key) {
      key = Buffer.from(hkdfSync("sha256", master, info, userId, 32));
      keys.set(cacheKey, key);
    }
    return key;
  };
  const keyFor = (userId: string) => derive("penny-data", userId);

  return {
    seal(userId, value) {
      const iv = randomBytes(IV_BYTES);
      const cipher = createCipheriv("aes-256-gcm", keyFor(userId), iv);
      cipher.setAAD(Buffer.from(userId));
      const body = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
      return `${VERSION}:${Buffer.concat([iv, body, cipher.getAuthTag()]).toString("base64")}`;
    },

    open(userId, sealed) {
      const [version, payload] = sealed.split(":");
      if (version !== VERSION || !payload) throw new Error("unknown encrypted value format");
      const bytes = Buffer.from(payload, "base64");
      const decipher = createDecipheriv("aes-256-gcm", keyFor(userId), bytes.subarray(0, IV_BYTES));
      decipher.setAAD(Buffer.from(userId));
      decipher.setAuthTag(bytes.subarray(bytes.length - TAG_BYTES));
      const body = bytes.subarray(IV_BYTES, bytes.length - TAG_BYTES);
      return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
    },

    fingerprint(userId, value) {
      return createHmac("sha256", derive("penny-fingerprint", userId))
        .update(value)
        .digest("base64url");
    },
  };
}
