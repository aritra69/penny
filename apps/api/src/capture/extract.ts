import { openai, type OpenAILanguageModelResponsesOptions } from "@ai-sdk/openai";
import { generateText, Output, type LanguageModel } from "ai";
import { z } from "zod";
import {
  CAPTURE_KINDS,
  CAPTURE_MODEL,
  CAPTURE_PROMPT_CACHE_KEY,
  CAPTURE_SYSTEM_PROMPT,
} from "../constants/index.ts";

/** What the model reads out of one message. Amounts stay text here; `money.ts` converts them. */
export const extractionSchema = z.object({
  kind: z.enum(CAPTURE_KINDS),
  amount: z.string().nullable(),
  currency: z.string(),
  counterparty: z.string().nullable(),
  accountLast4: z.string().nullable(),
  reference: z.string().nullable(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
});

export type Extraction = z.infer<typeof extractionSchema>;

export type MessageToRead = { sender: string; title: string | null; text: string };

/** Reads one message. Swapped for a fake in tests. */
export type Extractor = (message: MessageToRead) => Promise<Extraction>;

export function createExtractor(model: LanguageModel = openai(CAPTURE_MODEL)): Extractor {
  return async ({ sender, title, text }) => {
    const { output } = await generateText({
      model,
      system: CAPTURE_SYSTEM_PROMPT,
      prompt: [`Sender: ${sender}`, title ? `Title: ${title}` : null, `Message: ${text}`]
        .filter(Boolean)
        .join("\n"),
      output: Output.object({ schema: extractionSchema, name: "message" }),
      providerOptions: {
        openai: {
          promptCacheKey: CAPTURE_PROMPT_CACHE_KEY,
          // Bank messages are personal data: don't keep them on OpenAI's side.
          store: false,
        } satisfies OpenAILanguageModelResponsesOptions,
      },
    });
    return output;
  };
}
