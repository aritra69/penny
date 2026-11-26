/** Must match MIN_PASSWORD_LENGTH in apps/api/src/constants/auth.ts. */
export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Quick checks before hitting the API, one field per screen. Each returns what to fix, or null.
 * The server validates again.
 */
export const checkName = (name: string) => (name.trim() ? null : "Enter your name.");

export const checkEmail = (email: string) =>
  EMAIL_PATTERN.test(email.trim()) ? null : "Enter a valid email address.";

/** Logging in: any password the account might have. */
export const checkPassword = (password: string) => (password ? null : "Enter your password.");

/** Creating an account: long enough for the API to accept. */
export function checkNewPassword(password: string) {
  if (!password) return "Enter a password.";
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}
