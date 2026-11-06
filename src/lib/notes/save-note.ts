import { prisma } from "@/lib/prisma";
import { countWords, jsonToPlainText } from "@/lib/notes";
import { plainCloneJson } from "@/lib/tiptap-json";
import { scheduleNoteReindex } from "@/lib/ai/reindex";

export type SaveNoteInput = {
  noteId: string;
  title: string;
  contentJson: unknown;
  version: number;
};

export type SaveNoteResult =
  | {
      conflict: true;
      currentVersion: number;
      title: string;
      contentJson: unknown;
    }
  | {
      conflict: false;
      version: number;
      updatedAt: Date;
      wordCount: number;
    };

export async function saveNoteForUser(
  userId: string,
  input: SaveNoteInput,
): Promise<SaveNoteResult> {
  const existing = await prisma.note.findFirst({
    where: { id: input.noteId, userId, deletedAt: null },
  });
  if (!existing) throw new Error("Note not found");

  if (existing.version !== input.version) {
    return {
      conflict: true,
      currentVersion: existing.version,
      title: existing.title,
      contentJson: existing.contentJson,
    };
  }

  const contentJson = plainCloneJson(input.contentJson) as object;
  const contentText = jsonToPlainText(contentJson);
  const wordCount = countWords(contentText);
  const nextTitle = input.title?.trim() ? input.title : "Untitled";
  const contentChanged =
    JSON.stringify(existing.contentJson) !== JSON.stringify(contentJson) ||
    existing.title !== nextTitle;

  if (contentChanged) {
    const lastVersion = await prisma.noteVersion.findFirst({
      where: { noteId: input.noteId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, title: true, contentJson: true },
    });
    const ageMs = lastVersion
      ? Date.now() - lastVersion.createdAt.getTime()
      : Number.POSITIVE_INFINITY;
    const lastSame =
      lastVersion &&
      lastVersion.title === existing.title &&
      JSON.stringify(lastVersion.contentJson) ===
        JSON.stringify(existing.contentJson);
    if (
      !lastSame &&
      (ageMs > 90_000 || !lastVersion || lastVersion.title !== existing.title)
    ) {
      await prisma.noteVersion.create({
        data: {
          noteId: input.noteId,
          title: existing.title,
          contentJson: plainCloneJson(existing.contentJson) as object,
        },
      });
      const excess = await prisma.noteVersion.findMany({
        where: { noteId: input.noteId },
        orderBy: { createdAt: "desc" },
        skip: 50,
        select: { id: true },
      });
      if (excess.length) {
        await prisma.noteVersion.deleteMany({
          where: { id: { in: excess.map((v) => v.id) } },
        });
      }
    }
  }

  const note = await prisma.note.update({
    where: { id: input.noteId },
    data: {
      title: nextTitle,
      contentJson,
      contentText,
      wordCount,
      version: { increment: 1 },
    },
  });

  if (contentChanged) {
    scheduleNoteReindex(note.id, userId);
  }

  return {
    conflict: false,
    version: note.version,
    updatedAt: note.updatedAt,
    wordCount: note.wordCount,
  };
}
