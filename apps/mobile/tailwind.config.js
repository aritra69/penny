/**
 * Penny's tokens and type scale come from @repo/design-system. Add app-only theme
 * extensions here; change shared tokens in packages/design-system/tailwind-preset.js.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/design-system/src/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset"), require("@repo/design-system/tailwind-preset")],
};
