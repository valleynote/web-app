import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AppTopBar from "@/components/app/AppTopBar";
import MyNotesActions from "@/components/app/MyNotesActions";
import MyNotesView from "@/components/app/MyNotesView";

export const metadata = { title: "My Notes — ValleyNote" };

export default async function MyNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const session = await requireSession();
  const { folder: folderParam } = await searchParams;
  const userId = session.user.id;

  const [notes, notebooks] = await Promise.all([
    prisma.note.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        contentText: true,
        color: true,
        updatedAt: true,
        isFavorite: true,
        notebook: {
          select: { id: true, name: true, color: true },
        },
      },
    }),
    prisma.notebook.findMany({
      where: { userId, archivedAt: null },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        color: true,
        parentId: true,
        _count: {
          select: {
            notes: { where: { deletedAt: null } },
          },
        },
      },
    }),
  ]);

  const folders = notebooks.map((nb) => ({
    id: nb.id,
    name: nb.name,
    color: nb.color,
    parentId: nb.parentId,
    noteCount: nb._count.notes,
  }));

  const initialFolderId =
    folderParam && folders.some((f) => f.id === folderParam)
      ? folderParam
      : null;

  const fallbackFolderId =
    folders.find((f) => !f.parentId)?.id ?? folders[0]?.id ?? null;

  const activeFolder = initialFolderId
    ? folders.find((f) => f.id === initialFolderId)
    : null;

  return (
    <div className="flex min-h-full flex-col">
      <AppTopBar
        title={activeFolder ? activeFolder.name : "My Notes"}
        subtitle="Browse every note as colorful cards. Group by folder, tint what matters."
        actions={
          <MyNotesActions
            folderId={initialFolderId}
            fallbackFolderId={fallbackFolderId}
          />
        }
      />
      <MyNotesView
        notes={notes}
        folders={folders}
        initialFolderId={initialFolderId}
      />
    </div>
  );
}
