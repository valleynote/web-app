"use client";

import type { Editor } from "@tiptap/react";
import {
  ChevronDown,
  ImagePlus,
  Sparkles,
  Tags,
  X,
} from "lucide-react";
import AiToolbar from "@/components/editor/AiToolbar";
import MediaToolbar, {
  type MediaToolbarHandle,
} from "@/components/editor/MediaToolbar";
import AgentPanel, {
  type AgentPanelHandle,
} from "@/components/editor/AgentPanel";

export type NoteToolsTab = "ai" | "media" | "organize";

const tabs: {
  id: NoteToolsTab;
  label: string;
  icon: typeof Sparkles;
  hint: string;
}[] = [
  { id: "ai", label: "AI", icon: Sparkles, hint: "⌘⇧A" },
  { id: "media", label: "Insert", icon: ImagePlus, hint: "⌘⇧I" },
  { id: "organize", label: "Organize", icon: Tags, hint: "⌘⇧O" },
];

type TabsProps = {
  openTab: NoteToolsTab | null;
  onOpenTab: (tab: NoteToolsTab | null) => void;
};

export function NoteToolsTabs({ openTab, onOpenTab }: TabsProps) {
  function toggle(tab: NoteToolsTab) {
    onOpenTab(openTab === tab ? null : tab);
  }

  return (
    <div className="inline-flex h-10 max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-bg-border/80 bg-white p-0.5 shadow-[0_6px_18px_rgba(26,26,26,0.03)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = openTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={selected}
            title={`${tab.label} (${tab.hint})`}
            onClick={() => toggle(tab.id)}
            className={`inline-flex h-full shrink-0 items-center gap-1.5 rounded-full px-3 font-switzer text-[12.5px] transition ${
              selected
                ? "bg-blue font-semibold text-white"
                : "font-medium text-[#6b6b6b] hover:bg-bg-soft hover:text-ink"
            }`}
          >
            <Icon
              size={13}
              strokeWidth={1.85}
              className={selected ? "text-white" : "text-muted"}
            />
            {tab.label}
            <ChevronDown
              size={12}
              strokeWidth={2}
              className={`opacity-70 transition ${selected ? "rotate-180" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}

type Props = {
  editor: Editor | null;
  noteId: string;
  title: string;
  onTitleChange: (title: string) => void;
  onVersion: (version: number) => void;
  openTab: NoteToolsTab | null;
  onOpenTab: (tab: NoteToolsTab | null) => void;
  mediaRef: React.RefObject<MediaToolbarHandle | null>;
  agentRef: React.RefObject<AgentPanelHandle | null>;
};

export default function NoteToolsBar({
  editor,
  noteId,
  title,
  onTitleChange,
  onVersion,
  openTab,
  onOpenTab,
  mediaRef,
  agentRef,
}: Props) {
  return (
    <div
      className={
        openTab ? "bg-[#faf9f7] px-4 py-2.5 md:px-7" : undefined
      }
    >
      <div
        className={
          openTab
            ? "note-tools-enter relative overflow-hidden rounded-[22px] border border-bg-border bg-[#faf9f7] p-4 md:p-5"
            : "sr-only"
        }
        aria-hidden={!openTab}
      >
        {openTab ? (
          <button
            type="button"
            onClick={() => onOpenTab(null)}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted transition hover:bg-white/70 hover:text-ink"
            aria-label="Close tools"
          >
            <X size={15} strokeWidth={1.85} />
          </button>
        ) : null}
        <div className={openTab === "ai" ? "block" : "hidden"}>
          <AiToolbar editor={editor} embedded />
        </div>
        <div className={openTab === "media" ? "block" : "hidden"}>
          <MediaToolbar
            ref={mediaRef}
            editor={editor}
            noteId={noteId}
            embedded
          />
        </div>
        <div className={openTab === "organize" ? "block" : "hidden"}>
          <AgentPanel
            ref={agentRef}
            editor={editor}
            noteId={noteId}
            title={title}
            onTitleChange={onTitleChange}
            onVersion={onVersion}
            embedded
            showMeta
          />
        </div>
      </div>
    </div>
  );
}
