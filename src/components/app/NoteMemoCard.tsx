"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderInput, Palette, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DeleteNoteModal from "@/components/editor/DeleteNoteModal";
import {
  MEMO_TILTS,
  NOTE_COLOR_SWATCHES,
  formatNoteUpdatedAt,
  isPresetNoteColor,
  normalizeHexColor,
  previewNoteText,
} from "@/lib/note-colors";
import {
  moveNoteAction,
  updateNoteColorAction,
} from "@/server/actions/notebooks";

export type MemoNote = {
  id: string;
  title: string;
  contentText: string | null;
  color: string | null;
  updatedAt: Date | string;
  isFavorite?: boolean;
  notebook: {
    id: string;
    name: string;
    color: string;
  };
};

export type MemoFolder = {
  id: string;
  name: string;
  color: string;
};

export default function NoteMemoCard({
  note,
  index,
  folders = [],
  showFolder = true,
}: {
  note: MemoNote;
  index: number;
  folders?: MemoFolder[];
  showFolder?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [menu, setMenu] = useState<"color" | "folder" | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [color, setColor] = useState<string | null>(note.color);
  const rootRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setColor(note.color);
  }, [note.color]);

  useEffect(() => {
    if (!menu) return;
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setMenu(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenu(null);
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const tint = color || note.notebook.color || "#3745f1";
  const updatedAt =
    typeof note.updatedAt === "string"
      ? new Date(note.updatedAt)
      : note.updatedAt;

  function setNoteColor(next: string | null) {
    const prev = color;
    const normalized = next ? normalizeHexColor(next) : null;
    setColor(normalized);
    setMenu(null);
    startTransition(async () => {
      try {
        await updateNoteColorAction({ noteId: note.id, color: normalized });
        router.refresh();
      } catch {
        setColor(prev);
        toast.error("Could not update color");
      }
    });
  }

  const customSelected = color !== null && !isPresetNoteColor(color);
  const customPickerValue = customSelected ? color : "#e11d48";

  function moveToFolder(notebookId: string) {
    if (notebookId === note.notebook.id) {
      setMenu(null);
      return;
    }
    setMenu(null);
    startTransition(async () => {
      try {
        await moveNoteAction({ noteId: note.id, notebookId });
        toast.success("Moved to folder");
        router.refresh();
      } catch {
        toast.error("Could not move note");
      }
    });
  }

  return (
    <li ref={rootRef} className="group relative pt-3">
      <Link
        href={`/app/n/${note.id}`}
        className={`sticky-memo sticky-memo--tinted ${MEMO_TILTS[index % MEMO_TILTS.length]} p-4 pt-5 md:p-5`}
        style={{ ["--memo-tint" as string]: tint }}
        data-color={tint}
      >
        <span
          aria-hidden
          className="sticky-memo-accent"
          style={{ background: tint }}
        />

        <h3 className="line-clamp-2 pr-8 font-inter-tight text-[15px] font-semibold leading-snug tracking-[-0.02em] text-ink md:text-[16px]">
          {note.title || "Untitled"}
        </h3>

        <p className="mt-2 line-clamp-3 flex-1 font-switzer text-[13px] leading-relaxed text-muted md:text-[13.5px]">
          {previewNoteText(note.contentText)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-bg-line pt-2.5">
          {showFolder ? (
            <p className="truncate font-switzer text-[11.5px] font-medium text-ink-soft">
              {note.notebook.name}
            </p>
          ) : (
            <span />
          )}
          <time className="shrink-0 font-switzer text-[11px] text-muted">
            {formatNoteUpdatedAt(updatedAt)}
          </time>
        </div>
      </Link>

      <div className="note-memo-actions absolute right-2 top-5 z-10 flex items-center gap-1">
        <button
          type="button"
          title="Note color"
          disabled={pending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenu((m) => (m === "color" ? null : "color"));
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-bg-border bg-white/95 text-muted shadow-sm backdrop-blur transition hover:border-blue/30 hover:text-blue disabled:opacity-60"
        >
          <Palette size={14} strokeWidth={1.85} />
        </button>
        {folders.length > 1 ? (
          <button
            type="button"
            title="Move to folder"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenu((m) => (m === "folder" ? null : "folder"));
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-bg-border bg-white/95 text-muted shadow-sm backdrop-blur transition hover:border-blue/30 hover:text-blue disabled:opacity-60"
          >
            <FolderInput size={14} strokeWidth={1.85} />
          </button>
        ) : null}
        <button
          type="button"
          title="Move to trash"
          disabled={pending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenu(null);
            setDeleteOpen(true);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-bg-border bg-white/95 text-muted shadow-sm backdrop-blur transition hover:border-red-200 hover:text-red-600 disabled:opacity-60"
        >
          <Trash2 size={14} strokeWidth={1.85} />
        </button>
      </div>

      <DeleteNoteModal
        noteId={note.id}
        noteTitle={note.title}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          setDeleteOpen(false);
          router.refresh();
        }}
      />

      {menu === "color" ? (
        <div
          role="dialog"
          aria-label="Choose note color"
          className="absolute right-2 top-14 z-20 w-[168px] rounded-[16px] border border-bg-border bg-white p-3 shadow-[0_16px_40px_rgba(26,26,26,0.14)]"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-2 font-switzer text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              title="Default"
              onClick={() => setNoteColor(null)}
              className={`h-7 w-7 rounded-full border border-bg-border bg-bg-soft ${
                !color ? "ring-2 ring-ink/35 ring-offset-2" : ""
              }`}
            />
            {NOTE_COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => setNoteColor(c)}
                className={`h-7 w-7 rounded-full transition ${
                  color === c ? "ring-2 ring-ink/35 ring-offset-2" : ""
                }`}
                style={{ background: c }}
              />
            ))}
            <label
              title="Custom color"
              className={`relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-bg-border ${
                customSelected ? "ring-2 ring-ink/35 ring-offset-2" : ""
              }`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: customSelected
                    ? customPickerValue
                    : "conic-gradient(from 90deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)",
                }}
              />
              <input
                type="color"
                aria-label="Pick a custom color"
                value={customPickerValue}
                onChange={(e) => setNoteColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
          </div>
        </div>
      ) : null}

      {menu === "folder" ? (
        <div
          role="dialog"
          aria-label="Move to folder"
          className="absolute right-2 top-14 z-20 max-h-56 w-[200px] overflow-auto rounded-[16px] border border-bg-border bg-white p-1.5 shadow-[0_16px_40px_rgba(26,26,26,0.14)]"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="px-2.5 py-1.5 font-switzer text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Move to
          </p>
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => moveToFolder(folder.id)}
              className={`flex w-full items-center gap-2 rounded-[12px] px-2.5 py-2 text-left font-switzer text-[13px] transition hover:bg-bg-soft ${
                folder.id === note.notebook.id
                  ? "font-semibold text-ink"
                  : "text-ink-soft"
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: folder.color }}
              />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </li>
  );
}
