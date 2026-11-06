"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Hash, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { addNoteTagAction } from "@/server/actions/tags";

type Tag = { id: string; name: string; color: string };

type Props = {
  noteId: string;
  open: boolean;
  onClose: () => void;
  onAdded?: (tag: Tag) => void;
};

export default function AddTagModal({
  noteId,
  open,
  onClose,
  onAdded,
}: Props) {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pending]);

  function handleClose() {
    if (pending) return;
    setName("");
    onClose();
  }

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a tag name");
      inputRef.current?.focus();
      return;
    }
    startTransition(async () => {
      try {
        const tag = await addNoteTagAction(noteId, trimmed);
        onAdded?.(tag);
        window.dispatchEvent(new Event("valleynote:tags-changed"));
        toast.success(`Tagged #${tag.name}`);
        setName("");
        onClose();
      } catch {
        toast.error("Could not add tag");
      }
    });
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-tag-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-[420px] overflow-hidden rounded-[24px] border border-bg-border bg-white shadow-[0_24px_80px_rgba(26,26,26,0.22)]">
        <div className="flex items-start justify-between gap-3 px-5 pt-6 pb-1">
          <div>
            <p
              id="add-tag-title"
              className="font-switzer text-[15px] font-semibold text-ink"
            >
              Add a tag
            </p>
            <p className="mt-0.5 font-switzer text-[13px] text-muted">
              Organize this note with a short label.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={pending}
            className="rounded-full p-1.5 text-muted transition hover:bg-bg-soft hover:text-ink disabled:opacity-50"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.85} />
          </button>
        </div>

        <div className="px-5 pt-5 pb-6">
          <label
            htmlFor="add-tag-input"
            className="mb-1.5 block font-switzer text-[12px] font-semibold text-ink-soft"
          >
            Tag name
          </label>
          <div className="relative">
            <Hash
              size={15}
              strokeWidth={1.85}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
            />
            <input
              ref={inputRef}
              id="add-tag-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              disabled={pending}
              placeholder="e.g. ideas, work, follow-up"
              maxLength={40}
              className="h-12 w-full rounded-2xl border border-bg-border bg-bg-soft/50 pr-4 pl-10 font-switzer text-[14px] text-ink outline-none transition placeholder:text-muted focus:border-blue focus:bg-white focus:shadow-[0_0_0_3px_rgba(55,69,241,0.15)] disabled:opacity-60"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={pending}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-bg-border bg-white px-4 font-switzer text-[13.5px] font-semibold text-ink transition hover:bg-bg-soft disabled:opacity-60"
            >
              <X size={15} strokeWidth={1.85} />
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending || !name.trim()}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-blue px-4 font-switzer text-[13.5px] font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
            >
              {pending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Plus size={15} strokeWidth={1.85} />
                  Add tag
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
