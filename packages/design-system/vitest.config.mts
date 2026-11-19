import { defineConfig } from "vitest/config";

// Unit tests for plain TypeScript logic (src/lib). Components import `react-native`,
// which needs the native runtime, so they aren't tested here.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
