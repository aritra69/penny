import { tool } from "ai";
import { execute } from "./execute.ts";
import { description, inputSchema } from "./schema.ts";

export const calculator = tool({ description, inputSchema, execute });
