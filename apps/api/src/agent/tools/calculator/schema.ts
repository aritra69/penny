import { z } from "zod";

export const description =
  "Evaluate an arithmetic expression and return the number. Supports + - * / % ^ and parentheses, e.g. (1200 - 350) * 0.18.";

export const inputSchema = z.object({
  expression: z.string().describe("The arithmetic expression to evaluate"),
});

export type CalculatorInput = z.infer<typeof inputSchema>;

/** On failure the error goes back to the model so it can fix the expression and retry. */
export type CalculatorOutput = { result: number } | { error: string };
