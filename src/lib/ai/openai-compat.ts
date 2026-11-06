import { createOpenAI } from "@ai-sdk/openai";
import { aiConfig } from "@/lib/ai/config";

/** OpenAI-compatible client (OpenRouter or OpenAI) for embeddings + Whisper. */
export function getOpenAICompat() {
  if (aiConfig.provider === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");
    return {
      client: createOpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        headers: {
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          "X-Title": "ValleyNote",
        },
      }),
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return {
    client: createOpenAI({ apiKey }),
    apiKey,
    baseURL: "https://api.openai.com/v1",
  };
}
