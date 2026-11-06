import { generateText } from "ai";
import { z } from "zod";
import { aiConfig, trimForModel } from "@/lib/ai/config";
import { requireAiAccess } from "@/lib/ai/guard";
import { getLanguageModel } from "@/lib/ai/provider";
import { logAiUsage } from "@/lib/ai/quota";

const bodySchema = z.object({
  text: z.string().min(1).max(aiConfig.maxInputChars),
});

export async function POST(req: Request) {
  const access = await requireAiAccess();
  if (!access.ok) return access.response;
  const { session } = access;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { text, usage } = await generateText({
      model: getLanguageModel(),
      system:
        'Extract concrete action items from the text. Return ONLY a JSON array of short task strings, e.g. ["Email Alex","Draft outline"]. Max 8 items. Empty array if none.',
      prompt: trimForModel(parsed.data.text, "summarize"),
      maxOutputTokens: 300,
    });

    let tasks: string[] = [];
    try {
      const match = text.match(/\[[\s\S]*\]/);
      tasks = JSON.parse(match?.[0] ?? text) as string[];
    } catch {
      tasks = text
        .split("\n")
        .map((l) => l.replace(/^[-*\[\]\d.\s]+/, "").trim())
        .filter(Boolean);
    }

    tasks = tasks
      .map((t) => String(t).trim())
      .filter(Boolean)
      .slice(0, 8);

    await logAiUsage({
      userId: session.user.id,
      feature: "turn_into_tasks",
      model: aiConfig.chatModel,
      tokensIn: usage.inputTokens ?? 0,
      tokensOut: usage.outputTokens ?? 0,
    });

    return Response.json({ tasks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI unavailable";
    return Response.json({ error: message }, { status: 503 });
  }
}
