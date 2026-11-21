const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Penny keeps one .env at the repo root; Expo only reads this app's folder. Load the root file here,
// before Metro's workers start, so they inherit it and EXPO_PUBLIC_* vars get inlined.
try {
  process.loadEnvFile(path.resolve(__dirname, "../../.env"));
} catch {
  // No root .env yet: fall back to defaults.
}

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  // Tokens live in the design-system package; NativeWind compiles them from there.
  input: require.resolve("@repo/design-system/global.css"),
  inlineRem: 16,
});
