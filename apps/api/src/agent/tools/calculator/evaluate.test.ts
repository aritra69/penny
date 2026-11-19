import { describe, expect, test } from "bun:test";
import { evaluate } from "./evaluate.ts";

describe("evaluate", () => {
  test.each([
    ["1 + 2", 3],
    ["2 + 3 * 4", 14],
    ["(2 + 3) * 4", 20],
    ["10 / 4", 2.5],
    ["10 % 3", 1],
    ["2 ^ 3 ^ 2", 512],
    ["-2 ^ 2", -4],
    ["(-2) ^ 2", 4],
    ["--3", 3],
    [".5 + 1.25", 1.75],
    ["(1200 - 350) * 0.18", 153],
  ])("%s = %d", (expression, expected) => {
    expect(evaluate(expression)).toBeCloseTo(expected);
  });

  test.each([
    ["", "Empty expression"],
    ["1 / 0", "Division by zero"],
    ["5 % 0", "Division by zero"],
    ["(1 + 2", 'Expected ")"'],
    ["1 +", "Unexpected end of expression"],
    ["1 2", 'Unexpected "2"'],
    ["2,450", 'Unexpected ","'],
    ["process.exit()", 'Unexpected "p"'],
    ["10 ^ 400", "Result is not a finite number"],
  ])("rejects %p", (expression, message) => {
    expect(() => evaluate(expression)).toThrow(message);
  });
});
