import { generateText } from "ai";
import { z } from "zod";
import {
  aiConfig,
  maxOutputTokens,
  summarizeSystemPrompt,
  trimForModel,
} from "@/lib/ai/config";
import { requireAiAccess } from "@/lib/ai/guard";
import { getLanguageModel } from "@/lib/ai/provider";
import { logAiUsage } from "@/lib/ai/quota";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  noteId: z.string(),
});

export async function POST(req: Request) {
  const access = await requireAiAccess();
  if (!access.ok) return access.response;
  const { session } = access;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const note = await prisma.note.findFirst({
    where: {
      id: parsed.data.noteId,
      userId: session.user.id,
      deletedAt: null,
    },
  });
  if (!note) return Response.json({ error: "Note not found" }, { status: 404 });
  if (!note.contentText.trim()) {
    return Response.json({ error: "Note is empty" }, { status: 400 });
  }

  const content = trimForModel(note.contentText, "summarize");

  try {
    const result = await generateText({
      model: getLanguageModel(),
      system: summarizeSystemPrompt,
      prompt: `<user-content>\n${content}\n</user-content>`,
      maxOutputTokens: maxOutputTokens.summarize,
      temperature: 0.2,
    });

    await logAiUsage({
      userId: session.user.id,
      feature: "summarize",
      model: aiConfig.chatModel,
      tokensIn: result.usage.inputTokens ?? 0,
      tokensOut: result.usage.outputTokens ?? 0,
    });

    return Response.json({ summary: result.text });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI provider unavailable";
    return Response.json({ error: message }, { status: 503 });
  }
}
