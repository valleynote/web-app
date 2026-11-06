"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import {
  BookMarked,
  FileText,
  Hash,
  History,
  ImagePlus,
  Link2,
  ListTodo,
  Mic,
  Plus,
  Redo2,
  Save,
  Search,
  Sparkles,
  Star,
  Tags,
  Undo2,
  Wand2,
} from "lucide-react";
import {
  createNoteInDefaultNotebookAction,
  searchNotesAction,
} from "@/server/actions/notebooks";
import { openCreateNotebookModal } from "@/components/app/CreateNotebookModal";
import {
  getNoteCommands,
  subscribeNoteCommands,
  type NoteCommandId,
} from "@/lib/note-commands";

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent("valleynote:cmdk"));
}

const noteActions: {
  id: NoteCommandId;
  label: string;
  hint: string;
  icon: typeof Sparkles;
}[] = [
  { id: "save", label: "Save note", hint: "⌘S", icon: Save },
  { id: "undo", label: "Undo edit", hint: "⌘Z", icon: Undo2 },
  { id: "redo", label: "Redo edit", hint: "⌘⇧Z", icon: Redo2 },
  { id: "history", label: "Edit history", hint: "⌘⇧H", icon: History },
  { id: "summarize", label: "Summarize note", hint: "⌘⇧M", icon: Sparkles },
  { id: "auto-title", label: "Auto-title", hint: "⌘⇧T", icon: Wand2 },
  { id: "auto-tag", label: "Auto-tag", hint: "⌘⇧G", icon: Tags },
  { id: "tasks", label: "Turn into tasks", hint: "⌘⇧L", icon: ListTodo },
  { id: "related", label: "Find related notes", hint: "⌘⇧R", icon: Hash },
  { id: "favorite", label: "Toggle favorite", hint: "", icon: Star },
  { id: "open-ai", label: "Open AI writing tools", hint: "⌘⇧A", icon: Sparkles },
  { id: "insert-image", label: "Insert image", hint: "⌘⇧I", icon: ImagePlus },
  { id: "embed-video", label: "Embed video", hint: "", icon: Link2 },
  { id: "voice-note", label: "Voice note", hint: "", icon: Mic },
  { id: "open-organize", label: "Organize note", hint: "⌘⇧O", icon: Tags },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<
    { id: string; title: string; notebookId: string }[]
  >([]);
  const [pending, startTransition] = useTransition();
  const hasNoteCommands = useSyncExternalStore(
    subscribeNoteCommands,
    () => !!getNoteCommands(),
    () => false,
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (v) setQ("");
          return !v;
        });
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQ("");
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("valleynote:cmdk", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("valleynote:cmdk", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const trimmed = q.trim();
    if (!trimmed) {
      const id = window.setTimeout(() => setResults([]), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => {
      startTransition(async () => {
        setResults(await searchNotesAction(q));
      });
    }, 180);
    return () => window.clearTimeout(id);
  }, [q, open]);

  function closePalette() {
    setOpen(false);
    setQ("");
  }

  function runNoteAction(id: NoteCommandId) {
    const handlers = getNoteCommands();
    const fn = handlers?.[id];
    if (!fn) return;
    closePalette();
    void fn();
  }

  const query = q.trim().toLowerCase();
  const filteredNoteActions = hasNoteCommands
    ? noteActions.filter(
        (a) =>
          !query ||
          a.label.toLowerCase().includes(query) ||
          a.hint.toLowerCase().includes(query),
      )
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/30 px-4 pt-[14vh] backdrop-blur-[3px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={closePalette}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[20px] border border-bg-border bg-white shadow-[0_28px_90px_rgba(26,26,26,0.22)]">
        <div className="flex items-center gap-3 border-b border-bg-line px-4 py-3.5">
          <Search size={18} strokeWidth={1.75} className="text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search notes or run an action…"
            className="w-full bg-transparent font-switzer text-[15px] text-ink outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md bg-bg-muted px-1.5 py-0.5 font-switzer text-[11px] text-muted">
            esc
          </kbd>
        </div>
        <div className="max-h-[420px] overflow-auto p-2">
          {filteredNoteActions.length > 0 ? (
            <>
              <p className="px-2.5 py-1.5 font-switzer text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                This note
              </p>
              {filteredNoteActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left hover:bg-bg-soft"
                    onClick={() => runNoteAction(action.id)}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-blue/10 text-blue">
                      <Icon size={15} strokeWidth={1.85} />
                    </span>
                    <span className="flex-1 font-switzer text-[14px] text-ink">
                      {action.label}
                    </span>
                    {action.hint ? (
                      <kbd className="rounded-md bg-bg-muted px-1.5 py-0.5 font-switzer text-[11px] text-muted">
                        {action.hint}
                      </kbd>
                    ) : null}
                  </button>
                );
              })}
            </>
          ) : null}

          <p
            className={`px-2.5 py-1.5 font-switzer text-[11px] font-semibold uppercase tracking-[0.08em] text-muted ${
              filteredNoteActions.length ? "mt-2" : ""
            }`}
          >
            Actions
          </p>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left hover:bg-bg-soft"
            onClick={() => {
              startTransition(async () => {
                const note = await createNoteInDefaultNotebookAction();
                closePalette();
                router.push(`/app/n/${note.id}`);
              });
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-blue/10 text-blue">
              <Plus size={15} strokeWidth={1.85} />
            </span>
            <span className="font-switzer text-[14px] text-ink">Create new note</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left hover:bg-bg-soft"
            onClick={() => {
              closePalette();
              openCreateNotebookModal();
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-blue/10 text-blue">
              <BookMarked size={15} strokeWidth={1.85} />
            </span>
            <span className="font-switzer text-[14px] text-ink">Create folder</span>
          </button>
          <Link
            href="/app/chat"
            onClick={closePalette}
            className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 hover:bg-bg-soft"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-blue/10 text-blue">
              <Sparkles size={15} strokeWidth={1.85} />
            </span>
            <span className="font-switzer text-[14px] text-ink">AI Agent</span>
          </Link>

          {q.trim() ? (
            <>
              <p className="mt-2 px-2.5 py-1.5 font-switzer text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                Notes {pending ? "…" : ""}
              </p>
              {results.length === 0 && !pending ? (
                <p className="px-3 py-2 font-switzer text-[13px] text-muted">
                  No matching notes
                </p>
              ) : null}
              {results.map((r) => (
                <Link
                  key={r.id}
                  href={`/app/n/${r.id}`}
                  onClick={closePalette}
                  className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 hover:bg-bg-soft"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-bg-muted text-muted">
                    <FileText size={15} strokeWidth={1.75} />
                  </span>
                  <span className="font-switzer text-[14px] text-ink">
                    {r.title || "Untitled"}
                  </span>
                </Link>
              ))}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
