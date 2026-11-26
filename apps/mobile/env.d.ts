/**
 * `process.env.RN_PUBLIC_*` values, inlined into the bundle by babel.config.js (the list there
 * must match). Anything else on `process.env` is undefined at runtime.
 */
declare const process: {
  env: {
    NODE_ENV: "development" | "production" | "test";
    RN_PUBLIC_API_URL?: string;
    RN_PUBLIC_BETTER_AUTH_KV_URL?: string;
    RN_PUBLIC_GOOGLE_WEB_CLIENT_ID?: string;
    RN_PUBLIC_OPENAI_MODEL?: string;
  };
};
