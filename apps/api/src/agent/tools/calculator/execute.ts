import { evaluate } from "./evaluate.ts";
import type { CalculatorInput, CalculatorOutput } from "./schema.ts";

export const execute = async ({ expression }: CalculatorInput): Promise<CalculatorOutput> => {
  try {
    return { result: evaluate(expression) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
