import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NoteEditor from "@/components/editor/NoteEditor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  const session = await requireSession();
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId: session.user.id, deletedAt: null },
    select: { title: true },
  });
  return { title: `${note?.title || "Untitled"} — ValleyNote` };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  const session = await requireSession();
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId: session.user.id, deletedAt: null },
  });
  if (!note) notFound();

  return (
    <NoteEditor
      noteId={note.id}
      initialTitle={note.title}
      initialContent={note.contentJson}
      initialVersion={note.version}
      initialWordCount={note.wordCount}
      initialFavorite={note.isFavorite}
    />
  );
}
