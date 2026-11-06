import { embedMany } from "ai";
import { aiConfig } from "@/lib/ai/config";
import { getOpenAICompat } from "@/lib/ai/openai-compat";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const { client } = getOpenAICompat();
  const model = client.embedding(aiConfig.embeddingModel);
  const { embeddings } = await embedMany({
    model,
    values: texts,
  });
  return embeddings;
}

export function vectorLiteral(values: number[]) {
  return `[${values.join(",")}]`;
}
