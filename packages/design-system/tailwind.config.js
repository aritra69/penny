// Used only by tooling inside this package (Prettier's class sorting). Apps build their own
// config from tailwind-preset.js.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset"), require("./tailwind-preset")],
};
