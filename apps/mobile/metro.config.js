const path = require("node:path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

/**
 * Optional Expo modules that @better-auth/infra's native client tries with `await import()` inside
 * try/catch. Metro resolves every import at bundle time, so without this the build fails on a
 * package Penny doesn't install. Resolving them to an empty module lets the catch take over.
 */
const OPTIONAL_MODULES = new Set([
  "expo-constants",
  "expo-crypto",
  "expo-device",
  "@react-native-async-storage/async-storage",
]);

const config = mergeConfig(getDefaultConfig(projectRoot), {
  // bun hoists packages to the repo root (bunfig.toml), and the design system lives in packages/.
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(workspaceRoot, "node_modules"),
    ],
    resolveRequest: (context, moduleName, platform) =>
      OPTIONAL_MODULES.has(moduleName)
        ? { type: "empty" }
        : context.resolveRequest(context, moduleName, platform),
  },
});

module.exports = withNativeWind(config, {
  // Tokens live in the design-system package; NativeWind compiles them from there.
  input: require.resolve("@repo/design-system/global.css"),
  inlineRem: 16,
});
