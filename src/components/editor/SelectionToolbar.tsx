"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  ALargeSmall,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link2,
  Link2Off,
  Minus,
  Palette,
  Plus,
  Sparkles,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  bumpSelectionFontSize,
  getSelectionFontSize,
} from "@/components/editor/fontSize";
import type { WritingAction } from "@/lib/ai/writing-actions";

const TEXT_COLORS = [
  { id: "default", label: "Default", value: null, swatch: "#1a1a1a" },
  { id: "muted", label: "Gray", value: "#595959", swatch: "#595959" },
  { id: "blue", label: "Blue", value: "#3745f1", swatch: "#3745f1" },
  { id: "sky", label: "Sky", value: "#0284c7", swatch: "#2eb6ff" },
  { id: "green", label: "Green", value: "#15803d", swatch: "#22c55e" },
  { id: "orange", label: "Orange", value: "#c2410c", swatch: "#ff9d2e" },
  { id: "red", label: "Red", value: "#b42318", swatch: "#ef4444" },
] as const;

const HIGHLIGHTS = [
  { id: "none", label: "None", value: null, swatch: "transparent" },
  { id: "yellow", label: "Yellow", value: "#fef08a", swatch: "#fef08a" },
  { id: "green", label: "Green", value: "#bbf7d0", swatch: "#bbf7d0" },
  { id: "blue", label: "Blue", value: "#bfdbfe", swatch: "#bfdbfe" },
  { id: "pink", label: "Pink", value: "#fbcfe8", swatch: "#fbcfe8" },
  { id: "orange", label: "Orange", value: "#fed7aa", swatch: "#fed7aa" },
] as const;

type Panel = "none" | "color" | "highlight" | "link";

function ToolBtn({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-35 ${
        active
          ? "bg-blue text-white"
          : "text-ink-soft hover:bg-bg-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-bg-line" />;
}

export default function SelectionToolbar({ editor }: { editor: Editor | null }) {
  const [panel, setPanel] = useState<Panel>("none");
  const [linkUrl, setLinkUrl] = useState("");
  const [fontSize, setFontSize] = useState("16px");
  const [aiBusy, setAiBusy] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      setFontSize(getSelectionFontSize(editor));
      if (editor.isActive("link")) {
        setLinkUrl((editor.getAttributes("link").href as string) || "");
      }
    };
    editor.on("selectionUpdate", sync);
    editor.on("transaction", sync);
    sync();
    return () => {
      editor.off("selectionUpdate", sync);
      editor.off("transaction", sync);
    };
  }, [editor]);

  useEffect(() => {
    if (panel === "link") {
      const id = window.setTimeout(() => linkRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
  }, [panel]);

  if (!editor) return null;
  const ed = editor;

  function closePanels() {
    setPanel("none");
  }

  function applyLink() {
    const href = linkUrl.trim();
    if (!href) {
      ed.chain().focus().extendMarkRange("link").unsetLink().run();
      closePanels();
      return;
    }
    const withProtocol = /^https?:\/\//i.test(href) ? href : `https://${href}`;
    ed.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: withProtocol })
      .run();
    closePanels();
    toast.success("Link added");
  }

  async function runAi(action: WritingAction) {
    const { from, to } = ed.state.selection;
    if (from === to) {
      toast.error("Select text first");
      return;
    }
    const text = ed.state.doc.textBetween(from, to, " ");
    if (!text.trim()) return;

    setAiBusy(true);
    try {
      const res = await fetch("/api/ai/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "AI request failed");
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream from AI");
      const decoder = new TextDecoder();
      let output = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
      }
      if (!output.trim()) throw new Error("Empty AI response");
      ed.chain().focus().insertContentAt({ from, to }, output.trim()).run();
      toast.success("Applied");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI failed");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 10, flip: true }}
      shouldShow={({ editor: ed, state }) => {
        const { empty } = state.selection;
        if (empty || !ed.isEditable) return false;
        if (ed.isActive("image") || ed.isActive("videoEmbed")) return false;
        return true;
      }}
      className="selection-toolbar z-50 flex max-w-[min(92vw,560px)] flex-col gap-1.5 rounded-[16px] border border-bg-border bg-white p-1.5 shadow-[0_16px_48px_rgba(26,26,26,0.16)]"
    >
      <div className="flex flex-wrap items-center gap-0.5">
        <ToolBtn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={14} strokeWidth={2.1} />
        </ToolBtn>
        <ToolBtn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={14} strokeWidth={2.1} />
        </ToolBtn>
        <ToolBtn
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={14} strokeWidth={2.1} />
        </ToolBtn>
        <ToolBtn
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={14} strokeWidth={2.1} />
        </ToolBtn>

        <Divider />

        <ToolBtn
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 size={14} strokeWidth={2} />
        </ToolBtn>
        <ToolBtn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={14} strokeWidth={2} />
        </ToolBtn>
        <ToolBtn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 size={14} strokeWidth={2} />
        </ToolBtn>
        <ToolBtn
          title="Paragraph"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Type size={14} strokeWidth={2} />
        </ToolBtn>

        <Divider />

        <ToolBtn
          title="Smaller (⌘−)"
          onClick={() => bumpSelectionFontSize(editor, -1)}
        >
          <Minus size={14} strokeWidth={2.1} />
        </ToolBtn>
        <span
          className="inline-flex min-w-[2.4rem] items-center justify-center gap-0.5 px-1 font-switzer text-[11px] font-semibold text-muted"
          title="Font size"
        >
          <ALargeSmall size={12} strokeWidth={1.85} />
          {parseInt(fontSize, 10)}
        </span>
        <ToolBtn
          title="Bigger (⌘+)"
          onClick={() => bumpSelectionFontSize(editor, 1)}
        >
          <Plus size={14} strokeWidth={2.1} />
        </ToolBtn>

        <Divider />

        <ToolBtn
          title="Link"
          active={editor.isActive("link") || panel === "link"}
          onClick={() => {
            setLinkUrl((editor.getAttributes("link").href as string) || "");
            setPanel((p) => (p === "link" ? "none" : "link"));
          }}
        >
          <Link2 size={14} strokeWidth={2} />
        </ToolBtn>
        <ToolBtn
          title="Text color"
          active={panel === "color"}
          onClick={() => setPanel((p) => (p === "color" ? "none" : "color"))}
        >
          <Palette size={14} strokeWidth={2} />
        </ToolBtn>
        <ToolBtn
          title="Highlight"
          active={editor.isActive("highlight") || panel === "highlight"}
          onClick={() =>
            setPanel((p) => (p === "highlight" ? "none" : "highlight"))
          }
        >
          <Highlighter size={14} strokeWidth={2} />
        </ToolBtn>

        <Divider />

        <ToolBtn
          title="Rewrite with AI"
          disabled={aiBusy}
          onClick={() => void runAi("rewrite")}
        >
          <Sparkles size={14} strokeWidth={2} />
        </ToolBtn>
      </div>

      {panel === "link" ? (
        <div className="flex items-center gap-1.5 rounded-[12px] border border-bg-line bg-bg-soft/70 p-1.5">
          <input
            ref={linkRef}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") closePanels();
            }}
            placeholder="Paste a link…"
            className="h-8 min-w-0 flex-1 rounded-lg border border-bg-border bg-white px-2.5 font-switzer text-[12.5px] text-ink outline-none focus:border-blue"
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={applyLink}
            className="inline-flex h-8 items-center rounded-lg bg-blue px-2.5 font-switzer text-[12px] font-semibold text-white"
          >
            Apply
          </button>
          {editor.isActive("link") ? (
            <button
              type="button"
              title="Remove link"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setLinkUrl("");
                closePanels();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white hover:text-ink"
            >
              <Link2Off size={14} strokeWidth={1.85} />
            </button>
          ) : null}
        </div>
      ) : null}

      {panel === "color" ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-[12px] border border-bg-line bg-bg-soft/70 px-2 py-1.5">
          <span className="mr-1 font-switzer text-[11px] font-semibold text-muted">
            Color
          </span>
          {TEXT_COLORS.map((c) => {
            const active =
              c.value === null
                ? !editor.getAttributes("textStyle").color
                : editor.isActive("textStyle", { color: c.value });
            return (
              <button
                key={c.id}
                type="button"
                title={c.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (c.value === null) {
                    editor.chain().focus().unsetColor().run();
                  } else {
                    editor.chain().focus().setColor(c.value).run();
                  }
                  closePanels();
                }}
                className={`h-6 w-6 rounded-full border-2 transition ${
                  active ? "border-blue scale-110" : "border-white"
                } shadow-[0_0_0_1px_rgba(26,26,26,0.12)]`}
                style={{ background: c.swatch }}
              />
            );
          })}
        </div>
      ) : null}

      {panel === "highlight" ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-[12px] border border-bg-line bg-bg-soft/70 px-2 py-1.5">
          <span className="mr-1 font-switzer text-[11px] font-semibold text-muted">
            Highlight
          </span>
          {HIGHLIGHTS.map((h) => {
            const active =
              h.value === null
                ? !editor.isActive("highlight")
                : editor.isActive("highlight", { color: h.value });
            return (
              <button
                key={h.id}
                type="button"
                title={h.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (h.value === null) {
                    editor.chain().focus().unsetHighlight().run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .toggleHighlight({ color: h.value })
                      .run();
                  }
                  closePanels();
                }}
                className={`h-6 w-6 rounded-md border-2 transition ${
                  active ? "border-blue scale-110" : "border-bg-border"
                }`}
                style={{
                  background:
                    h.value === null
                      ? "repeating-linear-gradient(135deg,#fff,#fff 3px,#e5e1dc 3px,#e5e1dc 6px)"
                      : h.swatch,
                }}
              />
            );
          })}
        </div>
      ) : null}
    </BubbleMenu>
  );
}
