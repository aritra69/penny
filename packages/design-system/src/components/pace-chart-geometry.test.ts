import { describe, expect, it } from "vitest";

import { paceChartGeometry } from "./pace-chart-geometry";

const base = { width: 300, height: 196, daysInMonth: 30, budgetMinor: 4_000_000 };

describe("paceChartGeometry", () => {
  it("starts on the baseline and ends at the end of today", () => {
    const g = paceChartGeometry({ ...base, spentByDay: [100_000, 300_000, 450_000] });
    expect(g.baseline).toBe(160);
    expect(g.path.startsWith("M0.0 160.0")).toBe(true);
    expect(g.today.x).toBe(30); // end of day 3 of 30, on a 300-wide chart
  });

  it("puts the budget at the top of the plot when spending is under it", () => {
    const g = paceChartGeometry({ ...base, spentByDay: [2_000_000] });
    expect(g.budgetY).toBe(30);
    expect(g.today.y).toBe(95); // half the budget, half the plot height
  });

  it("stretches the scale when spending passes the budget", () => {
    const g = paceChartGeometry({ ...base, spentByDay: [8_000_000] });
    expect(g.today.y).toBe(30);
    expect(g.budgetY).toBe(95);
  });

  it("measures the drawn length for the draw-in animation", () => {
    const g = paceChartGeometry({ ...base, width: 30, daysInMonth: 3, spentByDay: [0] });
    expect(g.length).toBe(10);
  });

  it("handles an empty month", () => {
    const g = paceChartGeometry({ ...base, spentByDay: [] });
    expect(g.today).toEqual({ x: 0, y: 160 });
    expect(g.length).toBe(0);
  });
});
