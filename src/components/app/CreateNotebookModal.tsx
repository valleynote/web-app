"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, X } from "lucide-react";
import { toast } from "sonner";
import { normalizeHexColor } from "@/lib/note-colors";
import {
  createNotebookAction,
  createNoteAction,
} from "@/server/actions/notebooks";

const COLORS = [
  "#3745f1",
  "#2eb6ff",
  "#2f7a3e",
  "#b45309",
  "#7c3aed",
  "#db2777",
] as const;

export function openCreateNotebookModal() {
  window.dispatchEvent(new CustomEvent("valleynote:create-notebook"));
}

export default function CreateNotebookModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("New folder");
  const [color, setColor] = useState<string>(COLORS[0]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function onOpen() {
      setName("New folder");
      setColor(COLORS[0]);
      setOpen(true);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("valleynote:create-notebook", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("valleynote:create-notebook", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  function pickColor(next: string) {
    setColor(normalizeHexColor(next));
  }

  function create(openNote: boolean) {
    const label = name.trim() || "New folder";
    startTransition(async () => {
      try {
        const nb = await createNotebookAction({ name: label, color });
        toast.success("Folder created");
        setOpen(false);
        if (openNote) {
          const note = await createNoteAction(nb.id);
          router.push(`/app/n/${note.id}`);
        } else {
          router.push(`/app/notes?folder=${nb.id}`);
        }
        router.refresh();
      } catch {
        toast.error("Could not create folder");
      }
    });
  }

  if (!open) return null;

  const customSelected = !(COLORS as readonly string[]).includes(color);
  const customPickerValue = customSelected ? color : "#e11d48";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/30 px-4 py-6 backdrop-blur-[3px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[20px] border border-bg-border bg-white shadow-[0_28px_90px_rgba(26,26,26,0.22)]">
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-[11px]"
              style={{ background: `${color}18`, color }}
            >
              <BookMarked size={16} strokeWidth={1.85} />
            </span>
            <p className="font-inter-tight text-[16px] font-semibold text-ink">
              New folder
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-muted hover:bg-bg-soft hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1.5 block font-switzer text-[12px] font-medium text-muted">
              Name
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !pending) create(true);
              }}
              className="w-full rounded-[12px] border border-bg-border bg-bg-soft px-3.5 py-2.5 font-switzer text-[15px] text-ink outline-none ring-blue/30 focus:bg-white focus:ring-2"
              placeholder="e.g. Product ideas, Work, Personal"
            />
          </label>

          <div>
            <span className="mb-1.5 block font-switzer text-[12px] font-medium text-muted">
              Color
            </span>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => pickColor(c)}
                  className={`h-8 w-8 rounded-full transition ${
                    color === c ? "ring-2 ring-offset-2 ring-ink/40" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
              <label
                title="Custom color"
                className={`relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-bg-border ${
                  customSelected ? "ring-2 ring-offset-2 ring-ink/40" : ""
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
                  onChange={(e) => pickColor(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-5 pb-5 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={pending}
            onClick={() => create(false)}
            className="rounded-full px-4 py-2.5 font-switzer text-[13px] font-medium text-ink hover:bg-bg-soft disabled:opacity-60"
          >
            Create only
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => create(true)}
            className="rounded-full bg-blue px-4 py-2.5 font-switzer text-[13px] font-medium text-white shadow-[0_8px_20px_rgba(55,69,241,0.25)] disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create & write"}
          </button>
        </div>
      </div>
    </div>
  );
}
