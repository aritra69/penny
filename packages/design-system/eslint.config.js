// Same setup as apps/mobile: this package is React Native code.
const { defineConfig } = require("eslint/config");
const reactNativeConfig = require("@react-native/eslint-config/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  // Without the Flow block: Penny has no Flow, and eslint-plugin-ft-flow crashes on ESLint 9.
  reactNativeConfig.filter((config) => !config.plugins?.["ft-flow"]),
  eslintPluginPrettierRecommended,
  {
    rules: {
      // Styles here are NativeWind classes; inline `style` is kept for values computed at runtime
      // (safe-area insets, measured sizes), which a StyleSheet can't hold.
      "react-native/no-inline-styles": "off",
    },
  },
  {
    ignores: ["dist/*"],
  },
]);
