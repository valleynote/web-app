"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { openCreateNotebookModal } from "@/components/app/CreateNotebookModal";
import { createNoteAction } from "@/server/actions/notebooks";

export default function MyNotesActions({
  folderId,
  fallbackFolderId,
}: {
  folderId?: string | null;
  fallbackFolderId?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function createNote() {
    const target = folderId || fallbackFolderId;
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
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => openCreateNotebookModal()}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-bg-border bg-white px-4 font-switzer text-[13px] font-medium text-ink transition hover:border-blue/30 hover:bg-bg-soft hover:text-blue disabled:opacity-60"
      >
        <FolderPlus size={14} strokeWidth={1.85} />
        <span className="hidden sm:inline">New folder</span>
        <span className="sm:hidden">Folder</span>
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={createNote}
        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 font-switzer text-[13px] font-medium text-white transition hover:bg-ink-soft disabled:opacity-60"
      >
        <Plus size={14} strokeWidth={2} />
        <span className="hidden sm:inline">New note</span>
        <span className="sm:hidden">Note</span>
      </button>
    </>
  );
}
