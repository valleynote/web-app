"use client";

import { useEffect, useTransition } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { softDeleteNoteAction } from "@/server/actions/notebooks";

type Props = {
  noteId: string;
  noteTitle: string;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeleteNoteModal({
  noteId,
  noteTitle,
  open,
  onClose,
  onDeleted,
}: Props) {
  const [pending, startTransition] = useTransition();
  const displayTitle = noteTitle.trim() || "Untitled";

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onClose]);

  function confirmDelete() {
    startTransition(async () => {
      try {
        await softDeleteNoteAction(noteId);
        toast.success("Moved to trash");
        onDeleted();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not delete note");
      }
    });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-note-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <div className="w-full max-w-[420px] overflow-hidden rounded-[24px] border border-bg-border bg-white shadow-[0_24px_80px_rgba(26,26,26,0.22)]">
        <div className="flex items-start justify-between gap-3 px-5 pt-6 pb-1">
          <div>
            <p
              id="delete-note-title"
              className="font-switzer text-[15px] font-semibold text-ink"
            >
              Move note to trash?
            </p>
            <p className="mt-0.5 font-switzer text-[13px] text-muted">
              You can restore it later from Trash.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-full p-1.5 text-muted transition hover:bg-bg-soft hover:text-ink disabled:opacity-50"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.85} />
          </button>
        </div>

        <div className="px-5 pt-5 pb-6">
          <div className="rounded-2xl border border-bg-line bg-bg-soft/60 px-4 py-3.5">
            <p className="truncate font-switzer text-[13.5px] font-semibold text-ink">
              {displayTitle}
            </p>
            <ul className="mt-2.5 space-y-1.5 font-switzer text-[13px] text-muted">
              <li>• The note leaves your notebooks and favorites</li>
              <li>• Edit history stays with the note in Trash</li>
              <li>• You can restore it anytime from Trash</li>
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-bg-border bg-white px-4 font-switzer text-[13.5px] font-semibold text-ink transition hover:bg-bg-soft disabled:opacity-60"
            >
              <X size={15} strokeWidth={1.85} />
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={pending}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#b42318] px-4 font-switzer text-[13.5px] font-semibold text-white transition hover:bg-[#912018] disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Moving…
                </>
              ) : (
                <>
                  <Trash2 size={15} strokeWidth={1.85} />
                  Move to trash
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
