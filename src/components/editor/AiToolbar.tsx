"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Languages,
  PenLine,
  Sparkles,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { type WritingAction } from "@/lib/ai/writing-actions";

const labels: Record<WritingAction, string> = {
  continue: "Continue",
  rewrite: "Rewrite",
  shorten: "Shorten",
  expand: "Expand",
  fix_grammar: "Fix grammar",
  tone_formal: "Formal",
  tone_casual: "Casual",
  translate_fr: "→ FR",
  translate_ar: "→ AR",
};

const groups: {
  id: string;
  label: string;
  icon: typeof Sparkles;
  actions: WritingAction[];
}[] = [
  {
    id: "edit",
    label: "Edit",
    icon: PenLine,
    actions: ["continue", "rewrite", "shorten", "expand", "fix_grammar"],
  },
  {
    id: "tone",
    label: "Tone",
    icon: Type,
    actions: ["tone_formal", "tone_casual"],
  },
  {
    id: "translate",
    label: "Translate",
    icon: Languages,
    actions: ["translate_fr", "translate_ar"],
  },
];

export default function AiToolbar({
  editor,
  embedded = false,
}: {
  editor: Editor | null;
  embedded?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  async function run(action: WritingAction) {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const full = editor.getText();
    const text =
      from === to
        ? action === "continue"
          ? full.slice(-4000)
          : full.slice(0, 12_000)
        : editor.state.doc.textBetween(from, to, " ");
    if (!text.trim()) {
      toast.error("Select text or write something first.");
      return;
    }

    setLoading(true);
    setDraft(null);

    const res = await fetch("/api/ai/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, text }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      toast.error(data?.error ?? "AI request failed");
      setLoading(false);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      toast.error("No stream from AI");
      setLoading(false);
      return;
    }

    const decoder = new TextDecoder();
    let output = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      output += decoder.decode(value, { stream: true });
      setDraft(output);
    }
    setLoading(false);
    toast.success("AI draft ready");
  }

  function accept() {
    if (!editor || !draft) return;
    const { from, to, empty } = editor.state.selection;
    if (empty) {
      editor.commands.insertContent(draft);
    } else {
      editor.commands.insertContentAt({ from, to }, draft);
    }
    setDraft(null);
    toast.success("Changes applied");
  }

  const body = (
    <>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-switzer text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
            Writing AI
          </p>
          <p className="mt-0.5 font-switzer text-[13px] text-muted">
            Select text for targeted edits, or run on the whole note.
          </p>
        </div>
        <kbd className="hidden rounded-md bg-bg-muted px-1.5 py-0.5 font-switzer text-[11px] text-muted sm:inline">
          ⌘⇧A
        </kbd>
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.id}>
              <div className="mb-1.5 flex items-center gap-1.5 font-switzer text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                <Icon size={12} strokeWidth={1.85} />
                {group.label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.actions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    disabled={loading}
                    onClick={() => void run(action)}
                    className="rounded-full border border-bg-border bg-white px-3 py-1.5 font-switzer text-[12px] font-medium text-ink transition hover:border-blue/40 hover:bg-blue/[0.03] disabled:opacity-50"
                  >
                    {labels[action]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {draft ? (
        <div className="mt-4 rounded-[18px] border border-bg-border bg-white p-4 shadow-[0_8px_24px_rgba(26,26,26,0.04)]">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={14} className="text-blue" strokeWidth={1.85} />
            <p className="font-switzer text-[12px] font-semibold text-ink">
              Draft {loading ? "…" : "ready"}
            </p>
          </div>
          <p className="whitespace-pre-wrap font-switzer text-[14px] leading-relaxed text-ink">
            {draft}
            {loading ? "▍" : ""}
          </p>
          {!loading ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={accept}
                className="rounded-full bg-blue px-4 py-2 text-[13px] font-medium text-white transition hover:brightness-105"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-full bg-bg-muted px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-bg-line"
              >
                Discard
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );

  if (embedded) return <div className="note-tools-panel">{body}</div>;

  return (
    <div className="border-b border-bg-line bg-bg-soft px-5 py-3 md:px-8">
      {body}
    </div>
  );
}
