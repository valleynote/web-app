"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import NoteMemoCard, {
  type MemoFolder,
  type MemoNote,
} from "@/components/app/NoteMemoCard";
import { openCreateNotebookModal } from "@/components/app/CreateNotebookModal";
import { createNoteAction } from "@/server/actions/notebooks";

type Folder = MemoFolder & {
  noteCount: number;
  parentId: string | null;
};

export default function MyNotesView({
  notes,
  folders,
  initialFolderId = null,
}: {
  notes: MemoNote[];
  folders: Folder[];
  initialFolderId?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [folderId, setFolderId] = useState<string | null>(initialFolderId);

  useEffect(() => {
    setFolderId(initialFolderId);
  }, [initialFolderId]);

  const roots = useMemo(
    () => folders.filter((f) => !f.parentId),
    [folders],
  );

  const filtered = useMemo(() => {
    return notes.filter((note) => {
      if (folderId && note.notebook.id !== folderId) return false;
      return true;
    });
  }, [notes, folderId]);

  const activeFolder = folderId
    ? (folders.find((f) => f.id === folderId) ?? null)
    : null;

  function createInFolder() {
    const target = folderId || roots[0]?.id || folders[0]?.id;
    if (!target) {
      openCreateNotebookModal();
      return;
    }
    startTransition(async () => {
      try {
        const note = await createNoteAction(target);
        toast.success("Note created");
        router.push(`/app/n/${note.id}`);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not create note",
        );
      }
    });
  }

  return (
    <div className="w-full flex-1 px-4 py-5 md:px-7 md:py-6">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-[28px] border border-bg-border bg-white px-6 py-20 text-center shadow-[0_8px_24px_rgba(26,26,26,0.03)]">
          <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-blue/10 text-blue">
            <FileText size={26} strokeWidth={1.65} />
          </span>
          <p className="mt-5 font-inter-tight text-[20px] font-semibold tracking-[-0.02em] text-ink">
            {activeFolder ? "This folder is empty" : "No notes yet"}
          </p>
          <p className="mt-2 max-w-md font-switzer text-[14px] text-muted">
            Create a note or add a folder from the sidebar under My Notes.
          </p>
          <div className="mt-5">
            <button
              type="button"
              disabled={pending}
              onClick={createInFolder}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 font-switzer text-[13px] font-medium text-white"
            >
              <Plus size={14} strokeWidth={2} />
              New note
            </button>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 sm:gap-x-6 sm:gap-y-10">
          {filtered.map((note, index) => (
            <NoteMemoCard
              key={note.id}
              note={note}
              index={index}
              folders={folders}
              showFolder={!folderId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
