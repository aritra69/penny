/**
 * Pure layout maths for PaceChart, kept apart so it can be unit tested without react-native.
 * x: the start of the month at 0, the end of day d at d/daysInMonth of the width.
 * y: zero on the baseline, the budget on `budgetY`; the scale stretches if spending passes the budget.
 */
export type PaceChartGeometryInput = {
  width: number;
  height: number;
  daysInMonth: number;
  spentByDay: number[];
  budgetMinor: number;
};

/** Space under the baseline for day labels, and above the budget line for the callout. */
const AXIS_SPACE = 36;
const TOP_SPACE = 30;

export function paceChartGeometry({
  width,
  height,
  daysInMonth,
  spentByDay,
  budgetMinor,
}: PaceChartGeometryInput) {
  const baseline = height - AXIS_SPACE;
  const budgetY = TOP_SPACE;
  const plotHeight = baseline - budgetY;
  const max = Math.max(budgetMinor, ...spentByDay, 1);
  const x = (day: number) => (day / daysInMonth) * width;
  const y = (minor: number) => baseline - (minor / max) * plotHeight;

  const points = [{ x: 0, y: baseline }, ...spentByDay.map((v, i) => ({ x: x(i + 1), y: y(v) }))];
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }

  return {
    baseline,
    /** Where the budget sits; the even-pace line ends here at the end of the month. */
    budgetY: y(budgetMinor),
    path,
    length: Math.ceil(length),
    today: points[points.length - 1],
  };
}
