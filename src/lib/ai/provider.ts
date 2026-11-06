import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { aiConfig } from "@/lib/ai/config";

/**
 * Language model factory.
 * OpenRouter is the default — OpenAI-compatible API with Claude / GPT / Gemini.
 */
export function getLanguageModel() {
  if (aiConfig.provider === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    return anthropic(aiConfig.chatModel);
  }

  if (aiConfig.provider === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }
    const openrouter = createOpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "ValleyNote",
      },
    });
    return openrouter(aiConfig.chatModel);
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return openai(aiConfig.chatModel);
}
