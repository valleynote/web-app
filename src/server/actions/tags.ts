"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getNoteTagsAction(noteId: string) {
  const userId = await requireUserId();
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId },
    select: { id: true },
  });
  if (!note) return [];

  const rows = await prisma.noteTag.findMany({
    where: { noteId },
    include: { tag: true },
  });
  return rows.map((r) => ({
    id: r.tag.id,
    name: r.tag.name,
    color: r.tag.color,
  }));
}

export async function addNoteTagAction(noteId: string, name: string) {
  const userId = await requireUserId();
  const clean = z.string().min(1).max(32).parse(name.trim().toLowerCase());

  const note = await prisma.note.findFirst({
    where: { id: noteId, userId, deletedAt: null },
  });
  if (!note) throw new Error("Note not found");

  const tag = await prisma.tag.upsert({
    where: { userId_name: { userId, name: clean } },
    create: { userId, name: clean },
    update: {},
  });

  await prisma.noteTag.upsert({
    where: { noteId_tagId: { noteId, tagId: tag.id } },
    create: { noteId, tagId: tag.id },
    update: {},
  });

  revalidatePath("/app");
  return { id: tag.id, name: tag.name, color: tag.color };
}

export async function removeNoteTagAction(noteId: string, tagId: string) {
  const userId = await requireUserId();
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId },
  });
  if (!note) throw new Error("Note not found");

  await prisma.noteTag.deleteMany({
    where: { noteId, tagId },
  });
  revalidatePath("/app");
}
