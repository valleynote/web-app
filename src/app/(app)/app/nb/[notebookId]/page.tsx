import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreateNoteButton } from "@/components/app/CreateNoteButton";
import AppTopBar from "@/components/app/AppTopBar";
import NoteMemoCard from "@/components/app/NoteMemoCard";

export default async function NotebookPage({
  params,
}: {
  params: Promise<{ notebookId: string }>;
}) {
  const { notebookId } = await params;
  const session = await requireSession();
  const [notebook, folders] = await Promise.all([
    prisma.notebook.findFirst({
      where: { id: notebookId, userId: session.user.id },
      include: {
        notes: {
          where: { deletedAt: null },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            title: true,
            contentText: true,
            color: true,
            updatedAt: true,
            isFavorite: true,
          },
        },
      },
    }),
    prisma.notebook.findMany({
      where: { userId: session.user.id, archivedAt: null },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true, color: true },
    }),
  ]);
  if (!notebook) notFound();

  const notes = notebook.notes.map((note) => ({
    ...note,
    notebook: {
      id: notebook.id,
      name: notebook.name,
      color: notebook.color,
    },
  }));

  return (
    <div className="flex min-h-full flex-col">
      <AppTopBar
        title={notebook.name}
        subtitle={`${notebook.notes.length} notes in this folder.`}
      />
      <div className="w-full flex-1 space-y-5 px-4 py-5 md:px-7 md:py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-bg-border bg-white px-5 py-4 shadow-[0_8px_24px_rgba(26,26,26,0.03)]">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="h-11 w-11 shrink-0 rounded-[14px]"
              style={{
                background: `color-mix(in srgb, ${notebook.color} 22%, white)`,
                boxShadow: `inset 0 0 0 2px ${notebook.color}`,
              }}
            />
            <div className="min-w-0">
              <p className="font-switzer text-[13px] text-muted">
                Same card view as My Notes — color and regroup anytime.
              </p>
              <Link
                href={`/app/notes?folder=${notebook.id}`}
                className="mt-0.5 inline-flex font-switzer text-[13px] font-medium text-blue hover:underline"
              >
                Open in My Notes
              </Link>
            </div>
          </div>
          <CreateNoteButton notebookId={notebook.id} />
        </div>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center rounded-[28px] border border-bg-border bg-white px-6 py-16 text-center shadow-[0_8px_24px_rgba(26,26,26,0.03)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-bg-soft text-muted">
              <FileText size={22} strokeWidth={1.75} />
            </span>
            <p className="mt-4 font-inter-tight text-[18px] font-semibold text-ink">
              No notes yet
            </p>
            <p className="mt-1.5 font-switzer text-[14px] text-muted">
              Create your first note in this folder.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 sm:gap-x-6 sm:gap-y-10">
            {notes.map((note, index) => (
              <NoteMemoCard
                key={note.id}
                note={note}
                index={index}
                folders={folders}
                showFolder={false}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
