import { generateText } from "ai";
import { z } from "zod";
import { aiConfig, trimForModel } from "@/lib/ai/config";
import { requireAiAccess } from "@/lib/ai/guard";
import { getLanguageModel } from "@/lib/ai/provider";
import { logAiUsage } from "@/lib/ai/quota";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  noteId: z.string().min(1),
});

const TAG_COLORS = [
  "#3745f1",
  "#2eb6ff",
  "#2f7a3e",
  "#b45309",
  "#7c3aed",
  "#db2777",
];

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
        'Suggest 3 to 5 short tags for this note. Return ONLY a JSON array of strings, e.g. ["ideas","product"]. Lowercase, 1–2 words each, no #.',
      prompt: trimForModel(source, "summarize", 6000),
      maxOutputTokens: 120,
    });

    let names: string[] = [];
    try {
      const match = text.match(/\[[\s\S]*\]/);
      names = JSON.parse(match?.[0] ?? text) as string[];
    } catch {
      names = text
        .split(/[,\n]/)
        .map((s) => s.replace(/["#[\]]/g, "").trim())
        .filter(Boolean);
    }

    names = [...new Set(names.map((n) => n.toLowerCase().slice(0, 32)))].slice(
      0,
      5,
    );

    const tags: { id: string; name: string; color: string }[] = [];
    for (let i = 0; i < names.length; i += 1) {
      const name = names[i];
      const tag = await prisma.tag.upsert({
        where: {
          userId_name: { userId: session.user.id, name },
        },
        create: {
          userId: session.user.id,
          name,
          color: TAG_COLORS[i % TAG_COLORS.length],
        },
        update: {},
      });
      await prisma.noteTag.upsert({
        where: {
          noteId_tagId: { noteId: note.id, tagId: tag.id },
        },
        create: { noteId: note.id, tagId: tag.id },
        update: {},
      });
      tags.push({ id: tag.id, name: tag.name, color: tag.color });
    }

    await logAiUsage({
      userId: session.user.id,
      feature: "auto_tag",
      model: aiConfig.chatModel,
      tokensIn: usage.inputTokens ?? 0,
      tokensOut: usage.outputTokens ?? 0,
    });

    return Response.json({ tags });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI unavailable";
    return Response.json({ error: message }, { status: 503 });
  }
}
