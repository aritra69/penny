const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  // Tokens live in the design-system package; NativeWind compiles them from there.
  input: require.resolve("@repo/design-system/global.css"),
  inlineRem: 16,
});
