const path = require("node:path");

// Penny keeps one .env at the repo root. Load it here, not in metro.config.js: Metro's Babel
// workers are child processes and only see what this file loads. Restart Metro with
// `--reset-cache` after changing a value, since transformed files are cached.
try {
  process.loadEnvFile(path.resolve(__dirname, "../../.env"));
} catch {
  // No root .env yet: fall back to defaults.
}

/** Variables the app reads as `process.env.RN_PUBLIC_*`, inlined into the bundle at build time. */
const PUBLIC_KEYS = ["API_URL", "BETTER_AUTH_KV_URL", "GOOGLE_WEB_CLIENT_ID", "OPENAI_MODEL"];

// The Google web client ID is the API's GOOGLE_CLIENT_ID (it isn't secret), so one value serves both.
if (!process.env.RN_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_ID?.trim()) {
  process.env.RN_PUBLIC_GOOGLE_WEB_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
}

module.exports = {
  presets: [
    "module:@react-native/babel-preset",
    // Compiles `className` (NativeWind's JSX runtime) and adds Reanimated's worklets plugin.
    "nativewind/babel",
  ],
  plugins: [
    [
      "module-resolver",
      {
        root: [__dirname],
        // Mirrors `paths` in tsconfig.json; Metro doesn't read tsconfig.
        alias: { "^@/(.+)": "./\\1" },
        extensions: [
          ".ios.tsx",
          ".android.tsx",
          ".tsx",
          ".ios.ts",
          ".android.ts",
          ".ts",
          ".js",
          ".json",
        ],
      },
    ],
    [
      "transform-inline-environment-variables",
      { include: PUBLIC_KEYS.map((key) => `RN_PUBLIC_${key}`) },
    ],
  ],
};
