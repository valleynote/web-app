import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { chunkText, hashContent } from "@/lib/ai/chunk";
import { embedTexts, vectorLiteral } from "@/lib/ai/embeddings";
import { aiConfig } from "@/lib/ai/config";
import { logAiUsage } from "@/lib/ai/quota";

export async function reindexNote(noteId: string, userId: string) {
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId, deletedAt: null },
    select: { id: true, title: true, contentText: true },
  });
  if (!note) return { ok: false as const, reason: "not_found" as const };

  const body = `${note.title || "Untitled"}\n\n${note.contentText || ""}`.trim();
  const chunks = chunkText(body);
  const contentHash = hashContent(body);

  const prior = await prisma.noteChunk.findFirst({
    where: { noteId, chunkIndex: 0 },
    select: { contentHash: true },
  });
  if (prior?.contentHash === contentHash) {
    const count = await prisma.noteChunk.count({ where: { noteId } });
    if (count === chunks.length) {
      return { ok: true as const, skipped: true, chunks: count };
    }
  }

  await prisma.noteChunk.deleteMany({ where: { noteId } });

  if (chunks.length === 0) {
    return { ok: true as const, skipped: false, chunks: 0 };
  }

  let embeddings: number[][] = [];
  let embedded = false;
  try {
    embeddings = await embedTexts(chunks);
    embedded = embeddings.some((e) => e.length === aiConfig.embeddingDimensions);
  } catch (err) {
    logger.warn({ err, noteId }, "embedding failed; storing chunks without vectors");
    embeddings = chunks.map(() => []);
  }

  const now = new Date();
  for (let i = 0; i < chunks.length; i += 1) {
    const id = nanoid();
    await prisma.noteChunk.create({
      data: {
        id,
        noteId,
        userId,
        chunkIndex: i,
        content: chunks[i],
        contentHash,
        createdAt: now,
        updatedAt: now,
      },
    });

    const vector = embeddings[i];
    if (vector && vector.length === aiConfig.embeddingDimensions) {
      await prisma.$executeRawUnsafe(
        `UPDATE note_chunk SET embedding = $1::vector WHERE id = $2`,
        vectorLiteral(vector),
        id,
      );
    }
  }

  if (embedded) {
    await logAiUsage({
      userId,
      feature: "embed",
      model: aiConfig.embeddingModel,
      tokensIn: Math.ceil(body.length / 4),
    });
  }

  return { ok: true as const, skipped: false, chunks: chunks.length };
}

export function scheduleNoteReindex(noteId: string, userId: string) {
  void reindexNote(noteId, userId).catch((err) => {
    logger.error({ err, noteId }, "note reindex failed");
  });
}
