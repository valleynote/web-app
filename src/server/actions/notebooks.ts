"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { countWords, emptyDoc, jsonToPlainText } from "@/lib/notes";
import { scheduleNoteReindex } from "@/lib/ai/reindex";
import { HEX_COLOR_RE } from "@/lib/note-colors";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

const notebookSchema = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().max(8).optional(),
  color: z.string().max(32).optional(),
  parentId: z.string().nullable().optional(),
});

export async function createNotebookAction(input: z.infer<typeof notebookSchema>) {
  const userId = await requireUserId();
  const data = notebookSchema.parse(input);

  if (data.parentId) {
    const parent = await prisma.notebook.findFirst({
      where: { id: data.parentId, userId, parentId: null },
    });
    if (!parent) throw new Error("Invalid parent notebook");
  }

  const maxPos = await prisma.notebook.aggregate({
    where: { userId, parentId: data.parentId ?? null },
    _max: { position: true },
  });

  const notebook = await prisma.notebook.create({
    data: {
      userId,
      name: data.name,
      icon: data.icon ?? "📓",
      color: data.color ?? "#3745f1",
      parentId: data.parentId ?? null,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/notes");
  return notebook;
}

async function ensureNoteQuota(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const { getPlan } = await import("@/lib/plans");
  const plan = getPlan(sub?.plan ?? "free");
  if (plan.maxNotes === null) return;

  const noteCount = await prisma.note.count({
    where: { userId, deletedAt: null },
  });
  if (noteCount >= plan.maxNotes) {
    throw new Error(
      `${plan.name} plan limit reached (${plan.maxNotes} notes). Upgrade for more.`,
    );
  }
}

export async function createNoteAction(notebookId: string) {
  const userId = await requireUserId();
  const notebook = await prisma.notebook.findFirst({
    where: { id: notebookId, userId, archivedAt: null },
  });
  if (!notebook) throw new Error("Notebook not found");

  await ensureNoteQuota(userId);

  const note = await prisma.note.create({
    data: {
      userId,
      notebookId,
      title: "Untitled",
      contentJson: emptyDoc(),
      contentText: "",
      wordCount: 0,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/notes");
  return note;
}

export async function createNoteInDefaultNotebookAction() {
  const userId = await requireUserId();
  await ensureNoteQuota(userId);

  let notebook = await prisma.notebook.findFirst({
    where: { userId, archivedAt: null, parentId: null },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  if (!notebook) {
    notebook = await prisma.notebook.create({
      data: {
        userId,
        name: "Getting started",
        icon: "✨",
        color: "#3745f1",
        position: 0,
      },
    });
  }

  const note = await prisma.note.create({
    data: {
      userId,
      notebookId: notebook.id,
      title: "Untitled",
      contentJson: emptyDoc(),
      contentText: "",
      wordCount: 0,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/notes");
  return note;
}

const saveSchema = z.object({
  noteId: z.string(),
  title: z.string().max(200),
  contentJson: z.unknown(),
  version: z.number().int().positive(),
});

export async function saveNoteAction(input: z.infer<typeof saveSchema>) {
  const userId = await requireUserId();
  const data = saveSchema.parse(input);
  const { saveNoteForUser } = await import("@/lib/notes/save-note");
  return saveNoteForUser(userId, data);
}

export async function listNoteVersionsAction(noteId: string) {
  const userId = await requireUserId();
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId, deletedAt: null },
    select: { id: true },
  });
  if (!note) throw new Error("Note not found");

  const versions = await prisma.noteVersion.findMany({
    where: { noteId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      createdAt: true,
      contentJson: true,
    },
  });

  return versions.map((v) => {
    const preview = jsonToPlainText(v.contentJson as object)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 140);
    return {
      id: v.id,
      title: v.title,
      createdAt: v.createdAt,
      preview,
      wordCount: countWords(jsonToPlainText(v.contentJson as object)),
    };
  });
}

export async function restoreNoteVersionAction(noteId: string, versionId: string) {
  const userId = await requireUserId();
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId, deletedAt: null },
  });
  if (!note) throw new Error("Note not found");

  const snapshot = await prisma.noteVersion.findFirst({
    where: { id: versionId, noteId },
  });
  if (!snapshot) throw new Error("Version not found");

  // Keep current state in history before restore
  await prisma.noteVersion.create({
    data: {
      noteId,
      title: note.title,
      contentJson: JSON.parse(JSON.stringify(note.contentJson)) as object,
    },
  });

  const contentJson = JSON.parse(JSON.stringify(snapshot.contentJson)) as object;
  const contentText = jsonToPlainText(contentJson);
  const wordCount = countWords(contentText);

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: {
      title: snapshot.title || "Untitled",
      contentJson,
      contentText,
      wordCount,
      version: { increment: 1 },
    },
  });

  scheduleNoteReindex(noteId, userId);
  revalidatePath(`/app/n/${noteId}`);

  return {
    version: updated.version,
    title: updated.title,
    contentJson: updated.contentJson,
    wordCount: updated.wordCount,
    updatedAt: updated.updatedAt,
  };
}

export async function softDeleteNoteAction(noteId: string) {
  const userId = await requireUserId();
  await prisma.note.updateMany({
    where: { id: noteId, userId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/app");
  revalidatePath("/app/notes");
  revalidatePath("/app/trash");
  revalidatePath(`/app/n/${noteId}`);
}

export async function restoreNoteAction(noteId: string) {
  const userId = await requireUserId();
  await prisma.note.updateMany({
    where: { id: noteId, userId },
    data: { deletedAt: null },
  });
  revalidatePath("/app");
}

export async function toggleFavoriteAction(noteId: string) {
  const userId = await requireUserId();
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw new Error("Note not found");
  await prisma.note.update({
    where: { id: noteId },
    data: { isFavorite: !note.isFavorite },
  });
  revalidatePath("/app");
}

const hexColorSchema = z
  .string()
  .regex(HEX_COLOR_RE)
  .transform((c) => c.toLowerCase());

const noteColorSchema = z.object({
  noteId: z.string().min(1),
  color: hexColorSchema.nullable(),
});

export async function updateNoteColorAction(
  input: z.infer<typeof noteColorSchema>,
) {
  const userId = await requireUserId();
  const data = noteColorSchema.parse(input);

  const note = await prisma.note.findFirst({
    where: { id: data.noteId, userId, deletedAt: null },
    select: { id: true, updatedAt: true },
  });
  if (!note) throw new Error("Note not found");

  // Keep updatedAt so a tint change does not jump the note to the front
  // of lists ordered by recency.
  await prisma.note.update({
    where: { id: note.id },
    data: { color: data.color, updatedAt: note.updatedAt },
  });

  revalidatePath("/app");
  revalidatePath("/app/notes");
  revalidatePath(`/app/n/${data.noteId}`);
}

const notebookColorSchema = z.object({
  notebookId: z.string().min(1),
  color: hexColorSchema,
});

export async function updateNotebookColorAction(
  input: z.infer<typeof notebookColorSchema>,
) {
  const userId = await requireUserId();
  const data = notebookColorSchema.parse(input);

  const result = await prisma.notebook.updateMany({
    where: { id: data.notebookId, userId, archivedAt: null },
    data: { color: data.color },
  });
  if (result.count === 0) throw new Error("Folder not found");

  revalidatePath("/app");
  revalidatePath("/app/notes");
  revalidatePath(`/app/nb/${data.notebookId}`);
}

const moveNoteSchema = z.object({
  noteId: z.string().min(1),
  notebookId: z.string().min(1),
});

export async function moveNoteAction(input: z.infer<typeof moveNoteSchema>) {
  const userId = await requireUserId();
  const data = moveNoteSchema.parse(input);

  const notebook = await prisma.notebook.findFirst({
    where: { id: data.notebookId, userId, archivedAt: null },
    select: { id: true },
  });
  if (!notebook) throw new Error("Folder not found");

  const result = await prisma.note.updateMany({
    where: { id: data.noteId, userId, deletedAt: null },
    data: { notebookId: data.notebookId },
  });
  if (result.count === 0) throw new Error("Note not found");

  revalidatePath("/app");
  revalidatePath("/app/notes");
  revalidatePath(`/app/n/${data.noteId}`);
  revalidatePath(`/app/nb/${data.notebookId}`);
}

export async function searchNotesAction(query: string) {
  const userId = await requireUserId();
  const q = query.trim();
  if (!q) return [];

  return prisma.$queryRaw<
    { id: string; title: string; notebookId: string; rank: number }[]
  >`
    SELECT id, title, "notebookId",
      ts_rank("searchVector", plainto_tsquery('english', ${q})) AS rank
    FROM note
    WHERE "userId" = ${userId}
      AND "deletedAt" IS NULL
      AND "searchVector" @@ plainto_tsquery('english', ${q})
    ORDER BY rank DESC
    LIMIT 25
  `;
}
