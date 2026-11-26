/** Must match MIN_PASSWORD_LENGTH in apps/api/src/constants/auth.ts. */
export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignInFields = { email: string; password: string };
export type SignUpFields = SignInFields & { name: string };
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** One field at a time, for the sign-up steps. Each returns what to fix, or null. */
export const checkName = (name: string) => (name.trim() ? null : "Enter your name.");

export const checkEmail = (email: string) =>
  EMAIL_PATTERN.test(email.trim()) ? null : "Enter a valid email address.";

export function checkNewPassword(password: string) {
  if (!password) return "Enter a password.";
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

/** Quick checks before hitting the API. The server validates again. */
export function validateSignIn({ email, password }: SignInFields): FieldErrors<SignInFields> {
  const errors: FieldErrors<SignInFields> = {};
  const emailError = checkEmail(email);
  if (emailError) errors.email = emailError;
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function validateSignUp({ name, email, password }: SignUpFields): FieldErrors<SignUpFields> {
  const errors: FieldErrors<SignUpFields> = {};
  for (const [key, error] of [
    ["name", checkName(name)],
    ["email", checkEmail(email)],
    ["password", checkNewPassword(password)],
  ] as const) {
    if (error) errors[key] = error;
  }
  return errors;
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;
