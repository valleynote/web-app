import { streamText } from "ai";
import { z } from "zod";
import {
  aiConfig,
  maxOutputTokens,
  writingActions,
  writingPrompt,
  writingSystemPrompt,
} from "@/lib/ai/config";
import { requireAiAccess } from "@/lib/ai/guard";
import { getLanguageModel } from "@/lib/ai/provider";
import { logAiUsage } from "@/lib/ai/quota";

const bodySchema = z.object({
  action: z.enum(writingActions),
  text: z.string().min(1).max(aiConfig.maxInputChars),
});

export async function POST(req: Request) {
  const access = await requireAiAccess();
  if (!access.ok) return access.response;
  const { session } = access;

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const result = streamText({
      model: getLanguageModel(),
      system: writingSystemPrompt,
      prompt: writingPrompt(parsed.action, parsed.text),
      maxOutputTokens: maxOutputTokens[parsed.action],
      temperature: parsed.action === "continue" ? 0.7 : 0.3,
      onFinish: async ({ usage }) => {
        await logAiUsage({
          userId: session.user.id,
          feature: `writing:${parsed.action}`,
          model: aiConfig.chatModel,
          tokensIn: usage.inputTokens ?? 0,
          tokensOut: usage.outputTokens ?? 0,
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI provider unavailable";
    return Response.json({ error: message }, { status: 503 });
  }
}
