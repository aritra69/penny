const { hairlineWidth } = require("nativewind/theme");

/**
 * Penny's Tailwind preset for NativeWind. Colours read the CSS variables in global.css.
 * An app uses it with `presets: [require("nativewind/preset"), require("@repo/design-system/tailwind-preset")]`
 * and adds this package's src to `content`.
 *
 * Type: on Android a font weight is a separate font file, so each step names its family
 * (loaded by the app with expo-font) instead of setting fontWeight.
 * Pair a size with a family: `text-body font-sans-semibold`, `text-figure-xl font-display`.
 */
const fontSize = {
  "figure-xl": ["48px", { lineHeight: "50px", letterSpacing: "-1px" }], // hero balance
  "figure-lg": ["44px", { lineHeight: "50px", letterSpacing: "-1px" }], // amount inputs
  "figure-md": ["34px", { lineHeight: "40px", letterSpacing: "-0.5px" }], // draft card amount
  title: ["28px", { lineHeight: "34px", letterSpacing: "-0.5px" }], // screen titles
  heading: ["22px", { lineHeight: "28px" }], // section titles, box figures
  field: ["22px", { lineHeight: "28px" }], // text field values (Inter Bold)
  headline: ["17px", { lineHeight: "22px" }], // sheet headers, step names
  "body-lg": ["16px", { lineHeight: "24px" }], // Ask Penny prose, big buttons
  body: ["15px", { lineHeight: "22px" }], // default text, rows, buttons
  label: ["14px", { lineHeight: "20px" }], // links, figure labels
  caption: ["13px", { lineHeight: "19px" }], // secondary lines, field labels
  small: ["12px", { lineHeight: "17px" }], // box sublines, hints
  micro: ["11px", { lineHeight: "15px" }], // chart labels, disclaimers
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
        },
        "line-muted": "hsl(var(--line-muted))",
        faint: "hsl(var(--faint))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
        display: ["InterTight_800ExtraBold"],
        "display-bold": ["InterTight_700Bold"],
      },
      fontSize,
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius)",
      },
      // 1px rows and rules · 1.5px boxes and buttons · 2.5px selected, inputs, chart baseline · 3px active tab
      borderWidth: {
        hairline: hairlineWidth(),
        1.5: "1.5px",
        2.5: "2.5px",
        3: "3px",
      },
      spacing: {
        gutter: "20px", // screen side padding
        touch: "44px", // smallest tap target
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require("tailwindcss-animate")],
};
