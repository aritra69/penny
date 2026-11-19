/**
 * Hex mirrors of the tokens in global.css, for places className can't reach:
 * SVG strokes and fills, Moti animations, and icon colours. Keep in sync with global.css.
 */
export const colors = {
  ink: "#000000",
  paper: "#FFFFFF",
  subtle: "#F2F2F2",
  lineMuted: "#D4D4D4",
  faint: "#A3A3A3",
  mutedText: "#6B6B6B",
  highlight: "#E8F542",
  destructive: "#B91C1C",
} as const;

/**
 * Accent candidates explored on the design canvas. Highlighter is the chosen default;
 * the others stay listed so a later theme setting can swap `highlight`.
 */
export const accentOptions = {
  highlighter: "#E8F542",
  marigold: "#F2B01E",
  vermilion: "#E8412C",
  cobalt: "#2F4BFF",
} as const;

/** Border and stroke weights. */
export const strokes = {
  hair: 1, // list rows, rules inside boxes
  box: 1.5, // bordered boxes, secondary buttons, icons
  strong: 2.5, // selected choices, input underlines, chart baseline and line
  tab: 3, // active underline tab
} as const;

/** Layout constants in dp. */
export const layout = {
  gutter: 20,
  touch: 44,
  rowHeight: 60,
  buttonHeight: 56,
  compactButtonHeight: 48,
} as const;

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  display: "InterTight_800ExtraBold",
  displayBold: "InterTight_700Bold",
} as const;
