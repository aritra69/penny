/** Must match MIN_PASSWORD_LENGTH in apps/api/src/constants/auth.ts. */
export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignInFields = { email: string; password: string };
export type SignUpFields = SignInFields & { name: string };
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Quick checks before hitting the API. The server validates again. */
export function validateSignIn({ email, password }: SignInFields): FieldErrors<SignInFields> {
  const errors: FieldErrors<SignInFields> = {};
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function validateSignUp(fields: SignUpFields): FieldErrors<SignUpFields> {
  const errors: FieldErrors<SignUpFields> = validateSignIn(fields);
  if (!fields.name.trim()) errors.name = "Enter your name.";
  if (fields.password && fields.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return errors;
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;
