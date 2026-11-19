import { expect, test } from "bun:test";
import { execute } from "./execute.ts";

test("returns the result of a valid expression", async () => {
  expect(await execute({ expression: "(1200 - 350) * 0.2" })).toEqual({ result: 170 });
});

test("returns the error message instead of throwing", async () => {
  expect(await execute({ expression: "1 / 0" })).toEqual({ error: "Division by zero" });
});
