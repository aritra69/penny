import type { ToolSet } from "ai";
import { calculator } from "./calculator/index.ts";

/** Every tool the agent can call. Add a new tool here to give it to the agent. */
export const tools = {
  calculator,
} satisfies ToolSet;

export { calculator };
