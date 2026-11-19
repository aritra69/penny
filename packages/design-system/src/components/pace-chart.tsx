import { motifySvg } from "moti/svg";
import * as React from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";

import { formatMoney } from "../lib/money";
import { useMotion } from "../lib/motion";
import { colors, fonts, strokes } from "../lib/theme";
import { useAmountsHidden } from "./amount";
import { paceChartGeometry } from "./pace-chart-geometry";

const MotiPath = motifySvg(Path)();
const MotiCircle = motifySvg(Circle)();

type PaceChartProps = {
  daysInMonth: number;
  /** Running total spent at the end of each day so far (minor units). Its length is today's date. */
  spentByDay: number[];
  budgetMinor: number;
  currency: string;
  /** What the chart says, for screen readers: "₹21,580 spent by the 18th against …". */
  summary: string;
  height?: number;
};

/**
 * Spending this month against an even pace to the budget. A thick ink line for what was spent,
 * a dotted line for the even pace, a highlighter column on today, and a boxed callout.
 * The line draws itself in when it first appears.
 */
export function PaceChart({
  daysInMonth,
  spentByDay,
  budgetMinor,
  currency,
  summary,
  height = 196,
}: PaceChartProps) {
  const motion = useMotion();
  const hidden = useAmountsHidden();
  const [width, setWidth] = React.useState(0);
  const g = paceChartGeometry({ width, height, daysInMonth, spentByDay, budgetMinor });
  const spent = spentByDay.at(-1) ?? 0;
  const callout = `Spent ${hidden ? "••••" : formatMoney(spent, currency)}`;
  const calloutWidth = 128;
  const calloutX = Math.min(Math.max(g.today.x - calloutWidth / 2, 0), width - calloutWidth);

  return (
    <View
      role="img"
      aria-label={summary}
      style={{ height }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <Svg width={width} height={height} style={{ overflow: "visible" }}>
          {/* Today */}
          <Rect
            x={g.today.x - 11}
            y={36}
            width={22}
            height={g.baseline - 36}
            fill={colors.highlight}
          />
          {/* Even pace */}
          <Line
            x1={0}
            y1={g.baseline}
            x2={width}
            y2={g.budgetY}
            stroke={colors.ink}
            strokeWidth={strokes.hair}
            strokeDasharray="2 4"
          />
          <SvgText
            x={width - 4}
            y={22}
            textAnchor="end"
            fontSize={11}
            fontFamily={fonts.regular}
            fill={colors.ink}
          >
            even pace
          </SvgText>
          {/* Spent so far */}
          <MotiPath
            key={g.path}
            d={g.path}
            fill="none"
            stroke={colors.ink}
            strokeWidth={strokes.strong}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={[g.length, g.length]}
            from={{ strokeDashoffset: g.length }}
            animate={{ strokeDashoffset: 0 }}
            transition={motion.fill}
          />
          {/* Callout */}
          <Line
            x1={g.today.x}
            y1={28}
            x2={g.today.x}
            y2={g.today.y - 8}
            stroke={colors.ink}
            strokeWidth={strokes.hair}
            strokeDasharray="2 3"
          />
          <Rect
            x={calloutX}
            y={1}
            width={calloutWidth}
            height={27}
            fill={colors.paper}
            stroke={colors.ink}
            strokeWidth={strokes.box}
          />
          <SvgText
            x={calloutX + calloutWidth / 2}
            y={19.5}
            textAnchor="middle"
            fontSize={13}
            fontFamily={fonts.bold}
            fill={colors.ink}
          >
            {callout}
          </SvgText>
          <MotiCircle
            cx={g.today.x}
            cy={g.today.y}
            fill={colors.paper}
            stroke={colors.ink}
            strokeWidth={strokes.strong}
            from={{ r: 0 }}
            animate={{ r: 6 }}
            transition={motion.select}
          />
          {/* Axis */}
          <Line
            x1={0}
            y1={g.baseline}
            x2={width}
            y2={g.baseline}
            stroke={colors.ink}
            strokeWidth={strokes.strong}
          />
          <SvgText
            x={2}
            y={g.baseline + 20}
            fontSize={13}
            fontFamily={fonts.semibold}
            fill={colors.ink}
          >
            1
          </SvgText>
          <SvgText
            x={g.today.x}
            y={g.baseline + 20}
            textAnchor="middle"
            fontSize={13}
            fontFamily={fonts.bold}
            fill={colors.ink}
          >
            {String(spentByDay.length)}
          </SvgText>
          <Rect x={g.today.x - 12} y={g.baseline + 28} width={24} height={3} fill={colors.ink} />
          <SvgText
            x={width - 2}
            y={g.baseline + 20}
            textAnchor="end"
            fontSize={13}
            fontFamily={fonts.semibold}
            fill={colors.ink}
          >
            {String(daysInMonth)}
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}
