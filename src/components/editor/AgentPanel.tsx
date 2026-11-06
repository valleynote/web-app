"use client";

import { useImperativeHandle, useState, forwardRef } from "react";
import Link from "next/link";
import type { Editor } from "@tiptap/react";
import {
  Hash,
  ListTodo,
  Loader2,
  Sparkles,
  Tags,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import AddTagModal from "@/components/editor/AddTagModal";

type Related = { id: string; title: string; score: number };

export type AgentPanelHandle = {
  autoTitle: () => Promise<void>;
  autoTag: () => Promise<void>;
  findRelated: () => Promise<void>;
  turnIntoTasks: () => Promise<void>;
};

const AgentPanel = forwardRef<
  AgentPanelHandle,
  {
    editor: Editor | null;
    noteId: string;
    title: string;
    onTitleChange: (title: string) => void;
    onVersion?: (version: number) => void;
    embedded?: boolean;
    showMeta?: boolean;
  }
>(function AgentPanel(
  {
    editor,
    noteId,
    onTitleChange,
    onVersion,
    embedded = false,
    showMeta = true,
  },
  ref,
) {
  const [related, setRelated] = useState<Related[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  async function autoTitle() {
    setBusy("title");
    try {
      const res = await fetch("/api/ai/auto-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      const data = (await res.json()) as {
        title?: string;
        version?: number;
        error?: string;
      };
      if (!res.ok || !data.title) throw new Error(data.error ?? "Failed");
      onTitleChange(data.title);
      if (typeof data.version === "number") onVersion?.(data.version);
      toast.success("Title updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auto-title failed");
    } finally {
      setBusy(null);
    }
  }

  async function autoTag() {
    setBusy("tag");
    try {
      const res = await fetch("/api/ai/auto-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      const data = (await res.json()) as { tags?: unknown[]; error?: string };
      if (!res.ok || !data.tags) throw new Error(data.error ?? "Failed");
      window.dispatchEvent(new Event("valleynote:tags-changed"));
      toast.success("Tags added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auto-tag failed");
    } finally {
      setBusy(null);
    }
  }

  async function findRelated() {
    setBusy("related");
    try {
      const res = await fetch("/api/ai/related", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      const data = (await res.json()) as {
        related?: Related[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setRelated(data.related ?? []);
      if (!(data.related ?? []).length) toast.message("No related notes yet");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Related search failed");
    } finally {
      setBusy(null);
    }
  }

  async function turnIntoTasks() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text =
      from === to
        ? editor.getText()
        : editor.state.doc.textBetween(from, to, " ");
    if (!text.trim()) {
      toast.error("Write or select text first");
      return;
    }
    setBusy("tasks");
    try {
      const res = await fetch("/api/ai/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as { tasks?: string[]; error?: string };
      if (!res.ok || !data.tasks) throw new Error(data.error ?? "Failed");
      if (!data.tasks.length) {
        toast.message("No action items found");
        return;
      }
      editor
        .chain()
        .focus()
        .insertContent({
          type: "taskList",
          content: data.tasks.map((task) => ({
            type: "taskItem",
            attrs: { checked: false },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: task }],
              },
            ],
          })),
        })
        .run();
      toast.success("Tasks inserted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not extract tasks");
    } finally {
      setBusy(null);
    }
  }

  useImperativeHandle(ref, () => ({
    autoTitle,
    autoTag,
    findRelated,
    turnIntoTasks,
  }));

  const actions = (
    <div className="grid gap-2 sm:grid-cols-2">
      {(
        [
          {
            id: "title",
            label: "Auto-title",
            hint: "⌘⇧T",
            icon: Wand2,
            onClick: () => void autoTitle(),
          },
          {
            id: "tag",
            label: "Auto-tag",
            hint: "⌘⇧G",
            icon: Tags,
            onClick: () => void autoTag(),
          },
          {
            id: "tasks",
            label: "Turn into tasks",
            hint: "⌘⇧L",
            icon: ListTodo,
            onClick: () => void turnIntoTasks(),
          },
          {
            id: "related",
            label: "Related notes",
            hint: "⌘⇧R",
            icon: Sparkles,
            onClick: () => void findRelated(),
          },
        ] as const
      ).map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            disabled={!!busy}
            onClick={item.onClick}
            className="flex items-center gap-3 rounded-2xl border border-bg-border bg-white px-3.5 py-3 text-left transition hover:border-blue/35 hover:bg-blue/[0.03] disabled:opacity-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue">
              {busy === item.id ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Icon size={15} strokeWidth={1.85} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-switzer text-[13px] font-semibold text-ink">
                {item.label}
              </span>
              <span className="mt-0.5 block font-switzer text-[11px] text-muted">
                {item.hint}
              </span>
            </span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setTagModalOpen(true)}
        className="flex items-center gap-3 rounded-2xl border border-dashed border-bg-border bg-bg-soft/50 px-3.5 py-3 text-left transition hover:border-blue/35 hover:bg-white sm:col-span-2"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-muted text-muted">
          <Hash size={15} strokeWidth={1.85} />
        </span>
        <span className="font-switzer text-[13px] font-medium text-ink">
          Add tag manually
        </span>
      </button>
    </div>
  );

  const meta = showMeta && related.length > 0 ? (
    <div className="flex flex-wrap items-center gap-2 border-t border-bg-line/80 pt-3">
      <span className="font-switzer text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
        Related
      </span>
      {related.map((r) => (
        <Link
          key={r.id}
          href={`/app/n/${r.id}`}
          className="rounded-full border border-bg-border bg-white px-2.5 py-1 font-switzer text-[12px] text-ink transition hover:border-blue/30"
        >
          {r.title || "Untitled"}
        </Link>
      ))}
    </div>
  ) : null;

  const modal = (
    <AddTagModal
      noteId={noteId}
      open={tagModalOpen}
      onClose={() => setTagModalOpen(false)}
    />
  );

  if (embedded) {
    return (
      <>
        <div className="note-tools-panel space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-switzer text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
                Organize
              </p>
              <p className="mt-0.5 font-switzer text-[13px] text-muted">
                Title, tags, tasks, and related notes — without leaving the page.
              </p>
            </div>
          </div>
          {actions}
          {meta}
        </div>
        {modal}
      </>
    );
  }

  return (
    <>
      <div className="border-b border-bg-line/80 bg-white/40 px-5 py-3 md:px-8">
        {actions}
        {meta ? <div className="mt-2.5">{meta}</div> : null}
      </div>
      {modal}
    </>
  );
});

export default AgentPanel;
