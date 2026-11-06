"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { restoreNoteAction } from "@/server/actions/notebooks";

type Props = {
  noteId: string;
  title: string;
  notebookName: string;
  content: string;
};

/** First paragraph / line only — keeps View previews short for long or image-heavy notes. */
function firstParagraph(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const block = trimmed.split(/\n\s*\n/)[0]?.trim() || trimmed;
  const snippet = block.split("\n").find((line) => line.trim())?.trim() || block;
  if (snippet.length <= 280) return snippet;
  return `${snippet.slice(0, 277).trimEnd()}…`;
}

export function TrashActions({
  noteId,
  title,
  notebookName,
  content,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);
  const displayTitle = title.trim() || "Untitled";
  const full = content.trim();
  const body = firstParagraph(full);
  const hasMore = Boolean(full) && body !== full;

  useEffect(() => {
    if (!previewOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPreviewOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  function restore() {
    startTransition(async () => {
      try {
        await restoreNoteAction(noteId);
        toast.success("Note restored");
        setPreviewOpen(false);
        router.refresh();
      } catch {
        toast.error("Could not restore note");
      }
    });
  }

  return (
    <>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-bg-border bg-white px-4 font-switzer text-[14px] font-medium text-ink transition hover:bg-bg-soft sm:flex-none sm:px-4"
          aria-label={`View ${displayTitle}`}
        >
          <Eye size={15} strokeWidth={1.85} />
          View
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={restore}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-blue px-5 font-switzer text-[14px] font-medium text-white transition hover:bg-blue/90 disabled:opacity-60 sm:flex-none sm:w-auto"
        >
          <RotateCcw size={15} strokeWidth={1.85} />
          {pending ? "Restoring…" : "Restore"}
        </button>
      </div>

      {previewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trash-preview-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewOpen(false);
          }}
        >
          <div className="flex max-h-[min(80vh,720px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-bg-border bg-white shadow-[0_24px_80px_rgba(26,26,26,0.22)]">
            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 pb-2">
              <div className="min-w-0">
                <p
                  id="trash-preview-title"
                  className="truncate font-inter-tight text-[18px] font-semibold tracking-[-0.02em] text-ink"
                >
                  {displayTitle}
                </p>
                <p className="mt-1 truncate font-switzer text-[13px] text-muted">
                  {notebookName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-bg-soft hover:text-ink"
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.85} />
              </button>
            </div>

            <div className="px-5 py-4">
              {body ? (
                <div>
                  <p className="font-switzer text-[15px] leading-relaxed text-ink/85">
                    {body}
                  </p>
                  {hasMore ? (
                    <p className="mt-2 font-switzer text-[13px] text-muted">
                      Preview of first paragraph · restore to see full note
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="font-switzer text-[14px] text-muted">
                  This note has no content.
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 px-5 pb-5 pt-1">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-bg-border bg-white px-4 font-switzer text-[13.5px] font-semibold text-ink transition hover:bg-bg-soft"
              >
                <X size={15} strokeWidth={1.85} />
                Close
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={restore}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-blue px-4 font-switzer text-[13.5px] font-semibold text-white transition hover:bg-blue/90 disabled:opacity-60"
              >
                <RotateCcw size={15} strokeWidth={1.85} />
                {pending ? "Restoring…" : "Restore"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
