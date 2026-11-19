import Svg, { Circle, Path, Rect } from "react-native-svg";

import { colors, strokes } from "@/lib/theme";

/**
 * Penny's line icons, copied from the design canvas: 24×24 grid, square ends, 1.5 stroke,
 * no fills except dots. Some icons draw heavier by default (chevrons, check, send) as in the screens.
 */
const ICONS = {
  back: { weight: 1.5, draw: () => <Path d="M20 12H5M11 5l-7 7 7 7" /> },
  close: { weight: 1.5, draw: () => <Path d="M6 6l12 12M18 6L6 18" /> },
  "chevron-right": { weight: 2, draw: () => <Path d="M9 5l7 7-7 7" /> },
  "chevron-left": { weight: 1.5, draw: () => <Path d="M15 5l-7 7 7 7" /> },
  "chevron-down": { weight: 1.5, draw: () => <Path d="M5 9l7 7 7-7" /> },
  plus: { weight: 1.5, draw: () => <Path d="M12 5v14M5 12h14" /> },
  minus: { weight: 1.5, draw: () => <Path d="M5 12h14" /> },
  check: { weight: 2, draw: () => <Path d="M5 12l5 5 9-10" /> },
  "check-circle": {
    weight: 1.5,
    draw: () => (
      <>
        <Circle cx={12} cy={12} r={9.5} />
        <Path d="M7.5 12.5l3 3 6-6.5" />
      </>
    ),
  },
  info: {
    weight: 1.5,
    draw: () => (
      <>
        <Circle cx={12} cy={12} r={9.5} />
        <Path d="M12 7v6.5M12 16.5v.5" />
      </>
    ),
  },
  "clear-circle": {
    weight: 1.5,
    draw: () => (
      <>
        <Circle cx={12} cy={12} r={9} />
        <Path d="M9 9l6 6M15 9l-6 6" />
      </>
    ),
  },
  more: {
    weight: 0,
    draw: (c: string) => (
      <>
        <Circle cx={5} cy={12} r={1.6} fill={c} />
        <Circle cx={12} cy={12} r={1.6} fill={c} />
        <Circle cx={19} cy={12} r={1.6} fill={c} />
      </>
    ),
  },
  profile: {
    weight: 1.5,
    draw: () => (
      <>
        <Circle cx={12} cy={8} r={4} />
        <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </>
    ),
  },
  eye: {
    weight: 1.5,
    draw: () => (
      <>
        <Path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" />
        <Circle cx={12} cy={12} r={3} />
      </>
    ),
  },
  bell: {
    weight: 1.5,
    draw: () => (
      <>
        <Path d="M6 10a6 6 0 0 1 12 0c0 5 2 7 2 7H4s2-2 2-7" strokeLinejoin="round" />
        <Path d="M10 20.5h4" />
      </>
    ),
  },
  home: {
    weight: 1.5,
    draw: () => (
      <>
        <Path d="M3.5 10.5L12 4l8.5 6.5V20h-17z" strokeLinejoin="round" />
        <Path d="M9.5 20v-5.5h5V20" strokeLinejoin="round" />
      </>
    ),
  },
  spending: {
    weight: 1.5,
    draw: () => (
      <>
        <Path d="M4 20h16" />
        <Rect x={5.5} y={11} width={3.5} height={9} />
        <Rect x={10.25} y={5} width={3.5} height={15} />
        <Rect x={15} y={8.5} width={3.5} height={11.5} />
      </>
    ),
  },
  goals: {
    weight: 1.5,
    draw: (c: string) => (
      <>
        <Circle cx={12} cy={12} r={9} />
        <Circle cx={12} cy={12} r={4.5} />
        <Circle cx={12} cy={12} r={0.8} fill={c} />
      </>
    ),
  },
  wealth: {
    weight: 1.5,
    draw: () => <Path d="M3 12h18M5 12V8l7-4 7 4v4M6 12v6M10 12v6M14 12v6M18 12v6M3 20h18" />,
  },
  chat: {
    weight: 1.5,
    draw: () => <Path d="M4 4.5h16v11.5H10l-6 4z" strokeLinejoin="round" />,
  },
  history: {
    weight: 1.5,
    draw: () => (
      <>
        <Circle cx={12} cy={12} r={9} />
        <Path d="M12 7v5l3 2" />
      </>
    ),
  },
  compose: {
    weight: 1.5,
    draw: () => (
      <>
        <Path d="M4 20h4L19 9l-4-4L4 16z" />
        <Path d="M13 7l4 4" />
      </>
    ),
  },
  search: {
    weight: 1.5,
    draw: () => (
      <>
        <Circle cx={10.5} cy={10.5} r={6.5} />
        <Path d="M15.5 15.5L21 21" />
      </>
    ),
  },
  image: {
    weight: 1.5,
    draw: () => (
      <>
        <Rect x={3.5} y={4.5} width={17} height={15} />
        <Circle cx={9} cy={10} r={1.8} />
        <Path d="M4 18l5-5 4 4 3-3 4 4" />
      </>
    ),
  },
  send: { weight: 2, draw: () => <Path d="M12 19V5M5 12l7-7 7 7" /> },
  reply: { weight: 1.5, draw: () => <Path d="M5 4v9h13M14 9l4 4-4 4" /> },
  refresh: {
    weight: 1.5,
    draw: () => (
      <>
        <Path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
        <Path d="M18 3v4h-4M6 21v-4h4" />
      </>
    ),
  },
  transfer: { weight: 1.5, draw: () => <Path d="M4 8h13l-3-3M20 16H7l3 3" /> },
  phone: {
    weight: 1.5,
    draw: () => (
      <>
        <Rect x={7} y={2.5} width={10} height={19} rx={1.5} />
        <Path d="M10.5 18.5h3" />
      </>
    ),
  },
  lock: {
    weight: 1.5,
    draw: () => (
      <>
        <Rect x={5} y={10.5} width={14} height={10} />
        <Path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      </>
    ),
  },
  pin: {
    weight: 0,
    draw: (c: string) => <Path d="M9 3h6l-1 6 3 3v2h-4v7l-1 1-1-1v-7H7v-2l3-3z" fill={c} />,
  },
  steps: { weight: 1.5, draw: () => <Path d="M3 19h4v-5h5v-4h4V5h5" /> },
  list: { weight: 1.5, draw: () => <Path d="M4 7h16M4 12h16M4 17h10" /> },
  document: {
    weight: 1.5,
    draw: () => (
      <>
        <Path d="M6 3h9l4 4v14H6z" />
        <Path d="M15 3v4h4M9 12h7M9 16h7" />
      </>
    ),
  },
  "bar-chart": { weight: 1.5, draw: () => <Path d="M4 20V10M10 20V4M16 20v-8M3 20h18" /> },
  "arrow-down-circle": {
    weight: 1.5,
    draw: () => (
      <>
        <Circle cx={12} cy={12} r={10} />
        <Path d="M12 7v10M8 13l4 4 4-4" />
      </>
    ),
  },
  google: {
    weight: 0,
    draw: (c: string) => (
      <>
        <Path
          fill={c}
          d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"
        />
        <Path
          fill={c}
          d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"
        />
        <Path fill={c} d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z" />
        <Path
          fill={c}
          d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.7 9.4 6 12 6z"
        />
      </>
    ),
  },
} satisfies Record<string, { weight: number; draw: (color: string) => React.ReactNode }>;

export type IconName = keyof typeof ICONS;
export const iconNames = Object.keys(ICONS) as IconName[];

type IconProps = {
  name: IconName;
  /** Width and height in dp. Header and tab icons are 26, inline icons 18–22. */
  size?: number;
  color?: string;
  /** Overrides the icon's own default stroke. */
  strokeWidth?: number;
};

/** Decorative by default: give the surrounding button the accessible label. */
export function Icon({ name, size = 24, color = colors.ink, strokeWidth }: IconProps) {
  const icon = ICONS[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={icon.weight ? color : "none"}
      strokeWidth={strokeWidth ?? icon.weight ?? strokes.box}
      aria-hidden
    >
      {icon.draw(color)}
    </Svg>
  );
}
