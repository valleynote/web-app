/**
 * Backfill embeddings for all notes.
 * Usage: npx tsx scripts/reindex-notes.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { reindexNote } from "../src/lib/ai/reindex";

async function main() {
  const notes = await prisma.note.findMany({
    where: { deletedAt: null },
    select: { id: true, userId: true, title: true },
    orderBy: { updatedAt: "desc" },
  });

  console.log(`Reindexing ${notes.length} notes…`);
  let ok = 0;
  for (const note of notes) {
    try {
      const result = await reindexNote(note.id, note.userId);
      ok += 1;
      console.log(
        `✓ ${note.title || "Untitled"} (${result.chunks ?? 0} chunks${
          "skipped" in result && result.skipped ? ", skipped" : ""
        })`,
      );
    } catch (err) {
      console.error(`✗ ${note.id}`, err);
    }
  }
  console.log(`Done. ${ok}/${notes.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
