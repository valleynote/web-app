import { generateText } from "ai";
import { z } from "zod";
import { aiConfig, trimForModel } from "@/lib/ai/config";
import { requireAiAccess } from "@/lib/ai/guard";
import { getLanguageModel } from "@/lib/ai/provider";
import { logAiUsage } from "@/lib/ai/quota";
import { scheduleNoteReindex } from "@/lib/ai/reindex";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  noteId: z.string().min(1),
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

  const source = `${note.title}\n${note.contentText}`.trim();
  if (!source || source === "Untitled") {
    return Response.json({ error: "Write something first" }, { status: 400 });
  }

  try {
    const { text, usage } = await generateText({
      model: getLanguageModel(),
      system:
        "Create a short note title (3–8 words). Return only the title text. No quotes, punctuation at the end, or markdown.",
      prompt: trimForModel(source, "summarize", 6000),
      maxOutputTokens: 40,
    });

    const title = text
      .trim()
      .replace(/^["'#\s]+|["'\s.]+$/g, "")
      .slice(0, 120);

    if (!title) {
      return Response.json({ error: "Could not generate a title" }, { status: 500 });
    }

    const updated = await prisma.note.update({
      where: { id: note.id },
      data: { title, version: { increment: 1 } },
    });

    await logAiUsage({
      userId: session.user.id,
      feature: "auto_title",
      model: aiConfig.chatModel,
      tokensIn: usage.inputTokens ?? 0,
      tokensOut: usage.outputTokens ?? 0,
    });

    scheduleNoteReindex(note.id, session.user.id);

    return Response.json({
      title,
      version: updated.version,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI unavailable";
    return Response.json({ error: message }, { status: 503 });
  }
}
