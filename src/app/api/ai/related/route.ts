import { z } from "zod";
import { aiConfig } from "@/lib/ai/config";
import { embedTexts, vectorLiteral } from "@/lib/ai/embeddings";
import { requireAiAccess } from "@/lib/ai/guard";
import { logAiUsage } from "@/lib/ai/quota";
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
    select: { id: true, title: true, contentText: true },
  });
  if (!note) return Response.json({ error: "Note not found" }, { status: 404 });

  const seed = `${note.title}\n${(note.contentText || "").slice(0, 2000)}`.trim();
  if (!seed || seed === "Untitled") {
    return Response.json({ related: [] });
  }

  try {
    const [embedding] = await embedTexts([seed]);
    let related: { id: string; title: string; score: number }[] = [];

    if (embedding?.length) {
      const rows = await prisma.$queryRawUnsafe<
        { id: string; title: string; distance: number }[]
      >(
        `
        SELECT n.id, n.title, MIN(nc.embedding <=> $1::vector) AS distance
        FROM note_chunk nc
        JOIN note n ON n.id = nc."noteId"
        WHERE nc."userId" = $2
          AND n."deletedAt" IS NULL
          AND n.id <> $3
          AND nc.embedding IS NOT NULL
        GROUP BY n.id, n.title
        ORDER BY distance ASC
        LIMIT 5
        `,
        vectorLiteral(embedding),
        session.user.id,
        note.id,
      );
      related = rows.map((r) => ({
        id: r.id,
        title: r.title || "Untitled",
        score: 1 - Number(r.distance),
      }));
    }

    if (related.length === 0) {
      const recent = await prisma.note.findMany({
        where: {
          userId: session.user.id,
          deletedAt: null,
          id: { not: note.id },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true },
      });
      related = recent.map((r) => ({
        id: r.id,
        title: r.title || "Untitled",
        score: 0,
      }));
    }

    await logAiUsage({
      userId: session.user.id,
      feature: "related_notes",
      model: aiConfig.embeddingModel,
      tokensIn: Math.ceil(seed.length / 4),
    });

    return Response.json({ related });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI unavailable";
    return Response.json({ error: message }, { status: 503 });
  }
}
