import { expect, test } from "bun:test";
import { MockLanguageModelV4 } from "ai/test";
import { runAgent } from "./index.ts";

const usage = {
  inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 5, text: 5, reasoning: undefined },
};

// The mock returns one result per call, in order.
const scriptedModel = (...steps: Awaited<ReturnType<MockLanguageModelV4["doGenerate"]>>[]) =>
  new MockLanguageModelV4({ doGenerate: steps });

const toolCall = (expression: string) => ({
  content: [
    {
      type: "tool-call" as const,
      toolCallId: "call-1",
      toolName: "calculator",
      input: JSON.stringify({ expression }),
    },
  ],
  finishReason: { unified: "tool-calls" as const, raw: "tool_use" },
  usage,
  warnings: [],
});

const answer = (text: string) => ({
  content: [{ type: "text" as const, text }],
  finishReason: { unified: "stop" as const, raw: "end_turn" },
  usage,
  warnings: [],
});

test("runs the calculator, feeds the result back and stops on the final answer", async () => {
  const model = scriptedModel(toolCall("2450 * 0.18"), answer("GST is 441."));

  const result = await runAgent("What is 18% GST on 2450?", { model });

  expect(result.text).toBe("GST is 441.");
  expect(result.steps).toBe(2);
  expect(model.doGenerateCalls).toHaveLength(2);

  // The second call must carry the tool result from the first step.
  const toolMessage = result.messages.find((m) => m.role === "tool");
  expect(JSON.stringify(toolMessage)).toContain("441");
});

test("returns calculator errors to the model instead of throwing", async () => {
  const model = scriptedModel(toolCall("1 / 0"), answer("Can't divide by zero."));

  const result = await runAgent("1/0?", { model });

  expect(JSON.stringify(result.messages)).toContain("Division by zero");
  expect(result.text).toBe("Can't divide by zero.");
});

test("gives up after maxSteps", async () => {
  const model = scriptedModel(toolCall("1 + 1"), toolCall("1 + 1"), toolCall("1 + 1"));

  await expect(runAgent("loop forever", { model, maxSteps: 3 })).rejects.toThrow(
    "did not finish within 3 steps",
  );
});
