"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Command,
  PanelLeft,
  Plus,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { openCommandPalette } from "@/components/app/CommandPalette";
import { openChatHistory } from "@/components/app/chat-events";
import UserAvatar from "@/components/app/UserAvatar";
import { createNoteInDefaultNotebookAction } from "@/server/actions/notebooks";
import { useNoteChrome } from "@/components/editor/NoteChromeContext";
import { NoteToolsTabs } from "@/components/editor/NoteToolsBar";
import VoiceRecorder from "@/components/editor/VoiceRecorder";

function HeaderIcon({
  href,
  label,
  onClick,
  disabled,
  children,
}: {
  href?: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const className =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-bg-border/80 bg-white text-muted transition hover:border-bg-border hover:bg-bg-soft hover:text-ink disabled:opacity-50";

  if (href) {
    return (
      <Link href={href} className={className} title={label} aria-label={label}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export default function AppShellHeader({
  userName,
  userEmail,
  userImage,
}: {
  userName: string;
  userEmail: string;
  userImage?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const chrome = useNoteChrome();
  const onNotePage = chrome.active;
  const onChatPage = pathname === "/app/chat";

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 md:px-6">
      {onNotePage ? (
        <NoteToolsTabs
          openTab={chrome.toolsTab}
          onOpenTab={chrome.setToolsTab}
        />
      ) : onChatPage ? (
        <button
          type="button"
          onClick={() => openChatHistory()}
          className="inline-flex h-10 max-w-[280px] items-center gap-2 rounded-full border border-bg-border/80 bg-bg-soft/70 px-3.5 font-switzer text-[13px] font-medium text-ink transition hover:border-bg-border hover:bg-bg-soft md:max-w-[320px]"
        >
          <PanelLeft size={15} strokeWidth={1.75} className="shrink-0 text-muted" />
          Chats
        </button>
      ) : (
        <button
          type="button"
          onClick={() => openCommandPalette()}
          className="flex h-10 w-full max-w-[280px] items-center gap-2 rounded-full border border-bg-border/80 bg-bg-soft/70 px-3.5 text-left transition hover:border-bg-border hover:bg-bg-soft md:max-w-[320px]"
        >
          <Search size={15} strokeWidth={1.75} className="shrink-0 text-muted" />
          <span className="min-w-0 flex-1 truncate font-switzer text-[13px] text-muted">
            Search…
          </span>
          <kbd className="hidden shrink-0 rounded-md border border-bg-border bg-white px-1.5 py-0.5 font-switzer text-[10px] text-muted sm:inline-block">
            ⌘K
          </kbd>
        </button>
      )}

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {onNotePage ? (
          <>
            <VoiceRecorder
              editor={chrome.editor}
              noteId={chrome.noteId ?? ""}
              variant="header"
            />
            <HeaderIcon
              label="Commands (⌘K)"
              onClick={() => openCommandPalette()}
            >
              <Command size={16} strokeWidth={1.75} />
            </HeaderIcon>
            <div className="mx-1 hidden h-5 w-px bg-bg-line sm:block" />
          </>
        ) : null}

        <HeaderIcon href="/app/chat" label="AI Agent">
          <Sparkles size={16} strokeWidth={1.75} />
        </HeaderIcon>
        <HeaderIcon href="/app/favorites" label="Favorites">
          <Star size={16} strokeWidth={1.75} />
        </HeaderIcon>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              try {
                const note = await createNoteInDefaultNotebookAction();
                toast.success("Note created");
                router.push(`/app/n/${note.id}`);
                router.refresh();
              } catch {
                toast.error("Could not create note");
              }
            });
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-blue px-3.5 font-switzer text-[13px] font-medium text-white shadow-[0_8px_20px_rgba(55,69,241,0.25)] transition hover:bg-blue/90 disabled:opacity-60 sm:px-4"
          title="New note"
          aria-label="New note"
        >
          <Plus size={15} strokeWidth={2} />
          <span className="hidden sm:inline">
            {pending ? "Creating…" : "New note"}
          </span>
          <span className="sm:hidden">{pending ? "…" : "New"}</span>
        </button>

        <div className="mx-1 hidden h-5 w-px bg-bg-line sm:block" />

        <Link
          href="/app/settings"
          className="inline-flex rounded-full transition hover:opacity-90"
          title={userName}
          aria-label={`${userName} settings`}
        >
          <UserAvatar
            seed={userEmail || userName}
            name={userName}
            image={userImage}
            size={38}
            avatarStyle="notionists-neutral"
          />
        </Link>
      </div>
    </header>
  );
}
