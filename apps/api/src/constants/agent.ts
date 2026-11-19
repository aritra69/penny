export const AGENT_MODEL = "gpt-6-luna";
export const AGENT_MAX_STEPS = 10;

/** OpenAI caches prompts automatically; a fixed key routes every loop step to the same cache. */
export const AGENT_PROMPT_CACHE_KEY = "penny-agent";
