import { openai, type OpenAILanguageModelResponsesOptions } from "@ai-sdk/openai";
import { generateText, type LanguageModel, type ModelMessage } from "ai";
import {
  AGENT_MAX_STEPS,
  AGENT_MODEL,
  AGENT_PROMPT_CACHE_KEY,
  SYSTEM_PROMPT,
} from "../constants/index.ts";
import { tools } from "./tools/index.ts";

export interface RunAgentOptions {
  model?: LanguageModel;
  maxSteps?: number;
}

export interface RunAgentResult {
  text: string;
  steps: number;
  messages: ModelMessage[];
}

/**
 * A plain agent loop: call the model once per step, run any tool calls it makes
 * (generateText executes tools that have an `execute` function), append the
 * response to the history, and stop as soon as a step ends without tool calls.
 */
export const runAgent = async (
  prompt: string,
  { model = openai(AGENT_MODEL), maxSteps = AGENT_MAX_STEPS }: RunAgentOptions = {},
): Promise<RunAgentResult> => {
  const messages: ModelMessage[] = [{ role: "user", content: prompt }];

  for (let step = 1; step <= maxSteps; step++) {
    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      tools,
      providerOptions: {
        openai: {
          promptCacheKey: AGENT_PROMPT_CACHE_KEY,
          // Don't keep responses on OpenAI's side: this loop resends the full history itself.
          store: false,
          // With store off, reasoning comes back encrypted so it can be replayed next step.
          include: ["reasoning.encrypted_content"],
        } satisfies OpenAILanguageModelResponsesOptions,
      },
    });

    messages.push(...result.responseMessages);

    if (result.finishReason !== "tool-calls") {
      return { text: result.text, steps: step, messages };
    }
  }

  throw new Error(`Agent did not finish within ${maxSteps} steps`);
};
