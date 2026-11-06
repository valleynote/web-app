"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Clock3,
  History,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  listNoteVersionsAction,
  restoreNoteVersionAction,
} from "@/server/actions/notebooks";

type VersionRow = {
  id: string;
  title: string;
  createdAt: Date | string;
  preview: string;
  wordCount: number;
};

type Props = {
  noteId: string;
  open: boolean;
  onClose: () => void;
  onRestore: (payload: {
    title: string;
    contentJson: unknown;
    version: number;
    wordCount: number;
  }) => void;
};

function formatWhen(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NoteHistoryPanel({
  noteId,
  open,
  onClose,
  onRestore,
}: Props) {
  const [versions, setVersions] = useState<VersionRow[] | null>(null);
  const [pending, startTransition] = useTransition();
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const loading = open && versions === null;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void listNoteVersionsAction(noteId)
      .then((rows) => {
        if (!cancelled) setVersions(rows);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Could not load edit history");
        setVersions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, noteId, refreshKey]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onClose]);

  function restore(versionId: string) {
    setRestoringId(versionId);
    startTransition(async () => {
      try {
        const result = await restoreNoteVersionAction(noteId, versionId);
        onRestore({
          title: result.title,
          contentJson: result.contentJson,
          version: result.version,
          wordCount: result.wordCount,
        });
        toast.success("Restored previous version");
        setVersions(null);
        setRefreshKey((k) => k + 1);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Restore failed");
      } finally {
        setRestoringId(null);
      }
    });
  }

  if (!open) return null;

  return (
    <aside
      className="note-history-sidebar mx-3 mb-3 mt-2 flex max-w-full shrink-0 flex-col overflow-hidden rounded-[22px] border border-bg-border bg-[#f7f5f3] shadow-[0_8px_28px_rgba(26,26,26,0.05)] md:mx-3 md:ml-2 md:my-3 md:w-[300px]"
      role="complementary"
      aria-labelledby="note-history-title"
    >
      <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue text-white shadow-[0_6px_16px_rgba(55,69,241,0.28)]">
              <History size={14} strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p
                id="note-history-title"
                className="font-inter-tight text-[15px] font-semibold tracking-[-0.02em] text-ink"
              >
                Edit history
              </p>
              <p className="mt-0.5 font-switzer text-[11.5px] text-muted">
                {versions?.length
                  ? `${versions.length} snapshot${versions.length === 1 ? "" : "s"}`
                  : "Snapshots of this note"}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-white hover:text-ink disabled:opacity-50"
          aria-label="Close history"
        >
          <X size={15} strokeWidth={1.85} />
        </button>
      </div>

      <div className="note-history-scroll min-h-0 flex-1 overflow-auto px-3 pb-3 pt-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 font-switzer text-[13px] text-muted">
            <Loader2 size={18} className="animate-spin text-blue" />
            Loading snapshots…
          </div>
        ) : !versions?.length ? (
          <div className="flex flex-col items-center rounded-[20px] border border-dashed border-bg-border bg-white/60 px-4 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-soft text-muted">
              <Clock3 size={18} strokeWidth={1.65} />
            </span>
            <p className="mt-3.5 font-inter-tight text-[14px] font-semibold tracking-[-0.02em] text-ink">
              No snapshots yet
            </p>
            <p className="mt-1.5 max-w-[200px] font-switzer text-[12px] leading-relaxed text-muted">
              Keep writing — versions appear here as you edit.
            </p>
          </div>
        ) : (
          <ul className="relative space-y-0">
            <span
              aria-hidden
              className="absolute bottom-3 left-[15px] top-3 w-px bg-bg-line"
            />
            {versions.map((v, index) => {
              const busy = restoringId === v.id;
              const latest = index === 0;
              return (
                <li key={v.id} className="relative pl-8">
                  <span
                    aria-hidden
                    className={`absolute left-[10px] top-5 h-[11px] w-[11px] rounded-full border-2 ${
                      latest
                        ? "border-blue bg-blue shadow-[0_0_0_3px_rgba(55,69,241,0.16)]"
                        : "border-bg-border bg-white"
                    }`}
                  />
                  <div
                    className={`mb-2.5 rounded-[18px] border p-3.5 transition ${
                      latest
                        ? "border-blue/20 bg-white shadow-[0_10px_28px_rgba(55,69,241,0.08)]"
                        : "border-bg-border/80 bg-white/80 hover:border-bg-border hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate font-switzer text-[13.5px] font-semibold text-ink">
                        {v.title || "Untitled"}
                      </p>
                      {latest ? (
                        <span className="shrink-0 rounded-full bg-blue px-2 py-0.5 font-switzer text-[9px] font-semibold uppercase tracking-[0.07em] text-white">
                          Latest
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1.5 flex items-center justify-between gap-2 font-switzer text-[11px] text-muted">
                      <span>{formatWhen(v.createdAt)}</span>
                      <span>
                        {v.wordCount} word{v.wordCount === 1 ? "" : "s"}
                      </span>
                    </div>

                    {v.preview ? (
                      <p className="mt-2.5 line-clamp-3 border-t border-bg-line/70 pt-2.5 font-switzer text-[12px] leading-relaxed text-ink-soft">
                        {v.preview}
                      </p>
                    ) : (
                      <p className="mt-2.5 border-t border-bg-line/70 pt-2.5 font-switzer text-[12px] italic text-muted">
                        Empty snapshot
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => restore(v.id)}
                      className={`mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-3 font-switzer text-[12px] font-semibold transition disabled:opacity-50 ${
                        latest
                          ? "bg-blue text-white hover:bg-blue/90"
                          : "border border-bg-border bg-[#faf9f7] text-ink hover:border-blue/35 hover:bg-blue/5 hover:text-blue"
                      }`}
                    >
                      {busy ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <RotateCcw size={13} strokeWidth={1.85} />
                      )}
                      {busy ? "Restoring…" : "Restore this version"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
