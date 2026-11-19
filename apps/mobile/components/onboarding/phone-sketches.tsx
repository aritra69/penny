import Svg, { Circle, Path, Rect, Text as SvgText } from "react-native-svg";

import { colors, fonts, strokes } from "@repo/design-system";

/**
 * The three small phone drawings on the permissions step, showing where "Allow restricted
 * settings" is in Android's App info. Copied from the design canvas.
 */

const frame = { width: "100%", aspectRatio: 100 / 150 } as const;

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <Svg viewBox="0 0 100 150" style={frame} aria-hidden>
      <Rect
        x={1}
        y={1}
        width={98}
        height={148}
        rx={12}
        fill={colors.paper}
        stroke={colors.ink}
        strokeWidth={strokes.box}
      />
      {children}
    </Svg>
  );
}

const Bar = (props: { x: number; y: number; width: number; height?: number; ink?: boolean }) => (
  <Rect
    x={props.x}
    y={props.y}
    width={props.width}
    height={props.height ?? 4}
    fill={props.ink ? colors.ink : colors.faint}
  />
);

/** 1: App info, with the ⋮ menu marked. */
export function AppInfoMenuSketch() {
  return (
    <Phone>
      <Path d="M12 22h6M15 19l-3 3 3 3" stroke={colors.ink} strokeWidth={1.5} fill="none" />
      <Circle cx={84} cy={22} r={9} fill={colors.highlight} stroke={colors.ink} strokeWidth={1} />
      <Circle cx={84} cy={17.5} r={1.4} fill={colors.ink} />
      <Circle cx={84} cy={22} r={1.4} fill={colors.ink} />
      <Circle cx={84} cy={26.5} r={1.4} fill={colors.ink} />
      <Rect x={12} y={42} width={22} height={22} fill={colors.ink} />
      <Bar ink x={40} y={46} width={40} height={5} />
      <Bar x={40} y={56} width={26} />
      <Bar x={12} y={80} width={76} />
      <Bar x={12} y={94} width={66} />
      <Bar x={12} y={108} width={72} />
    </Phone>
  );
}

/** 2: the menu open on "Allow restricted settings". */
export function RestrictedSettingsSketch() {
  const label = { fontSize: 7.5, fontFamily: fonts.bold, fill: colors.ink } as const;
  return (
    <Phone>
      <Rect x={12} y={42} width={22} height={22} fill={colors.ink} />
      <Rect
        x={26}
        y={14}
        width={66}
        height={62}
        fill={colors.paper}
        stroke={colors.ink}
        strokeWidth={strokes.box}
      />
      <Bar x={32} y={22} width={42} />
      <Rect x={27} y={34} width={64} height={26} fill={colors.highlight} />
      <SvgText x={31} y={45} {...label}>
        Allow restricted
      </SvgText>
      <SvgText x={31} y={54} {...label}>
        settings
      </SvgText>
      <Bar x={32} y={66} width={34} />
      <Bar x={12} y={94} width={66} />
      <Bar x={12} y={108} width={72} />
    </Phone>
  );
}

/** 3: back in Penny, with the SMS switch on. */
export function AllowSmsSketch() {
  return (
    <Phone>
      <Bar ink x={12} y={20} width={40} height={5} />
      <Bar ink x={12} y={44} width={34} height={5} />
      <Rect x={66} y={40} width={22} height={13} rx={6.5} fill={colors.ink} />
      <Circle cx={81.5} cy={46.5} r={4.5} fill={colors.paper} />
      <Bar x={12} y={70} width={40} />
      <Rect
        x={66}
        y={66}
        width={22}
        height={13}
        rx={6.5}
        fill={colors.paper}
        stroke={colors.ink}
        strokeWidth={1.2}
      />
      <Circle cx={72.5} cy={72.5} r={4} fill={colors.ink} />
    </Phone>
  );
}
