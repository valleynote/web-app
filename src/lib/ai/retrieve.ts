import { prisma } from "@/lib/prisma";
import { embedTexts, vectorLiteral } from "@/lib/ai/embeddings";
import { logger } from "@/lib/logger";

export type RetrievedNote = {
  id: string;
  title: string;
  contentText: string;
  rank: number;
  via: "semantic" | "keyword" | "recent";
};

export async function retrieveNotesForQuestion(
  userId: string,
  question: string,
  limit = 6,
): Promise<RetrievedNote[]> {
  const byId = new Map<string, RetrievedNote>();

  // Keyword (FTS)
  try {
    const keyword = await prisma.$queryRaw<
      { id: string; title: string; contentText: string; rank: number }[]
    >`
      SELECT id, title, "contentText",
        ts_rank("searchVector", plainto_tsquery('english', ${question})) AS rank
      FROM note
      WHERE "userId" = ${userId}
        AND "deletedAt" IS NULL
        AND "searchVector" @@ plainto_tsquery('english', ${question})
      ORDER BY rank DESC
      LIMIT ${limit}
    `;
    for (const row of keyword) {
      byId.set(row.id, {
        id: row.id,
        title: row.title,
        contentText: row.contentText,
        rank: Number(row.rank) + 0.15,
        via: "keyword",
      });
    }
  } catch (err) {
    logger.warn({ err }, "keyword retrieval failed");
  }

  // Semantic (pgvector)
  try {
    const [queryEmbedding] = await embedTexts([question]);
    if (queryEmbedding?.length) {
      const lit = vectorLiteral(queryEmbedding);
      const semantic = await prisma.$queryRawUnsafe<
        {
          id: string;
          title: string;
          content: string;
          distance: number;
        }[]
      >(
        `
        SELECT n.id, n.title, nc.content,
          (nc.embedding <=> $1::vector) AS distance
        FROM note_chunk nc
        JOIN note n ON n.id = nc."noteId"
        WHERE nc."userId" = $2
          AND n."deletedAt" IS NULL
          AND nc.embedding IS NOT NULL
        ORDER BY nc.embedding <=> $1::vector
        LIMIT $3
        `,
        lit,
        userId,
        limit * 2,
      );

      for (const row of semantic) {
        const score = 1 - Number(row.distance);
        const prev = byId.get(row.id);
        if (!prev || score > prev.rank) {
          byId.set(row.id, {
            id: row.id,
            title: row.title,
            contentText: row.content,
            rank: score,
            via: "semantic",
          });
        } else if (prev.via === "keyword") {
          // Boost hybrid hits
          prev.rank += score * 0.35;
          prev.contentText = `${prev.contentText}\n${row.content}`.slice(0, 2400);
        }
      }
    }
  } catch (err) {
    logger.warn({ err }, "semantic retrieval failed; falling back to keyword/recent");
  }

  let results = [...byId.values()].sort((a, b) => b.rank - a.rank);

  if (results.length === 0) {
    const recent = await prisma.note.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: Math.min(limit, 5),
      select: { id: true, title: true, contentText: true },
    });
    results = recent.map((n, i) => ({
      id: n.id,
      title: n.title,
      contentText: n.contentText,
      rank: 0.01 * (recent.length - i),
      via: "recent" as const,
    }));
  }

  return results.slice(0, limit).map((n) => ({
    ...n,
    contentText: (n.contentText || "").slice(0, 1800),
  }));
}
