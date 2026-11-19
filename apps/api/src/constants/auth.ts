export const APP_NAME = "Penny";

/** Deep-link scheme of the mobile app (`scheme` in apps/mobile/app.json). */
export const APP_SCHEME = "penny";

/** Expo Go opens the app at exp://<lan-ip>:<port>/…, so these are trusted in development only. */
export const DEV_TRUSTED_ORIGINS = ["exp://", "exp://**"];

export const MIN_PASSWORD_LENGTH = 8;

/** Used when BETTER_AUTH_URL isn't set. */
export const DEFAULT_AUTH_URL = "http://localhost:4000";
