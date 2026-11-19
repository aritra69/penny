import { runAgent } from "./index.ts";

const prompt = Bun.argv.slice(2).join(" ").trim();
if (!prompt) {
  console.error('Usage: bun run agent "What is 18% GST on 2,450?"');
  process.exit(1);
}

const { text, steps } = await runAgent(prompt);
console.log(text);
console.error(`(${steps} step${steps === 1 ? "" : "s"})`);
