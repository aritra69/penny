import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for plain TypeScript logic (lib/, hooks' pure helpers, formatters…).
// Anything that imports `react-native` needs the native runtime and isn't covered here.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "android/**", "ios/**"],
  },
});
