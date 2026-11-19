import { config } from "@repo/eslint-config/base";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      globals: { ...globals.node, Bun: "readonly" },
    },
    rules: {
      // PORT / DATABASE_PATH are runtime settings for the server, not inputs to any cached turbo task.
      "turbo/no-undeclared-env-vars": "off",
    },
  },
  {
    ignores: ["drizzle/**", "data/**"],
  },
];
