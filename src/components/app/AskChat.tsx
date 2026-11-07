"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUp,
  BookPlus,
  Check,
  CheckCheck,
  Copy,
  FilePlus2,
  FileText,
  ListTodo,
  Loader2,
  MessageSquarePlus,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Pin,
  PinOff,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteChatThreadAction,
  getChatThreadAction,
  listChatThreadsAction,
  rateChatMessageAction,
  renameChatThreadAction,
  togglePinChatThreadAction,
} from "@/server/actions/chat";
import VoiceInputButton from "@/components/app/VoiceInputButton";
import ChatMarkdown from "@/components/app/ChatMarkdown";

type Source = { id: string; title: string; index: number };

type AgentAction = {
  type: string;
  label: string;
  noteId?: string;
  notebookId?: string;
  title?: string;
};

type MessageFeedback = "up" | "down" | null;

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  actions?: AgentAction[];
  feedback?: MessageFeedback;
  /** true when id is a client temp id (not yet in DB) */
  ephemeral?: boolean;
};

type ThreadListItem = {
  id: string;
  title: string;
  pinnedAt: Date | string | null;
  updatedAt: Date | string;
  _count: { messages: number };
};

type StreamEvent =
  | { type: "meta"; threadId: string; sources: Source[] }
  | { type: "action"; action: AgentAction }
  | { type: "text"; text: string }
  | { type: "sources"; sources: Source[] }
  | { type: "done" };

function citedSources(content: string, sources?: Source[]) {
  if (!sources?.length || !content) return [];
  const used = new Set<number>();
  for (const match of content.matchAll(/\[(\d+)\]/g)) {
    used.add(Number(match[1]));
  }
  if (used.size === 0) return [];
  return sources.filter((s) => used.has(s.index));
}

const SUGGESTIONS = [
  {
    label: "Research my notes",
    prompt: "What are my main open ideas across my notebooks?",
    icon: Search,
  },
  {
    label: "Create a note",
    prompt: "Create a new note titled Meeting ideas with a short outline.",
    icon: FilePlus2,
  },
  {
    label: "New notebook",
    prompt: "Create a notebook called Projects.",
    icon: BookPlus,
  },
  {
    label: "Find to-dos",
    prompt: "List anything that looks like a to-do in my notes.",
    icon: ListTodo,
  },
];

function parseCitations(raw: unknown): {
  sources?: Source[];
  actions?: AgentAction[];
  feedback?: MessageFeedback;
} {
  if (!raw) return {};
  if (Array.isArray(raw)) {
    return { sources: raw as Source[] };
  }
  if (typeof raw === "object") {
    const obj = raw as {
      sources?: Source[];
      actions?: AgentAction[];
      feedback?: MessageFeedback;
    };
    return {
      sources: Array.isArray(obj.sources) ? obj.sources : undefined,
      actions: Array.isArray(obj.actions) ? obj.actions : undefined,
      feedback:
        obj.feedback === "up" || obj.feedback === "down" ? obj.feedback : null,
    };
  }
  return {};
}

function actionHref(action: AgentAction) {
  if (action.noteId) return `/app/n/${action.noteId}`;
  if (action.notebookId) return `/app/nb/${action.notebookId}`;
  if (action.type === "delete_note" || action.type === "archive_notebook") {
    return "/app/trash";
  }
  return null;
}

export default function AskChat() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const bootstrapped = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function refreshThreads() {
    startTransition(async () => {
      setThreads(await listChatThreadsAction());
    });
  }

  useEffect(() => {
    refreshThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onOpenChats() {
      setHistoryOpen((v) => !v);
    }
    window.addEventListener("valleynote:chats", onOpenChats);
    return () => window.removeEventListener("valleynote:chats", onOpenChats);
  }, []);

  useEffect(() => {
    if (!menuOpenId) return;
    function onPointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpenId(null);
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpenId]);

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus();
  }, [renamingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length === 0) {
      inputRef.current?.focus();
    }
  }, [messages.length]);

  async function loadThread(id: string) {
    const thread = await getChatThreadAction(id);
    if (!thread) return;
    setThreadId(thread.id);
    setMessages(
      thread.messages.map((m) => {
        const parsed = parseCitations(m.citations);
        return {
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          sources: citedSources(m.content, parsed.sources),
          actions: parsed.actions,
          feedback: parsed.feedback ?? null,
          ephemeral: false,
        };
      }),
    );
    setHistoryOpen(false);
  }

  async function copyAnswer(msg: Message) {
    if (!msg.content.trim()) return;
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      toast.success("Copied");
      window.setTimeout(() => {
        setCopiedId((id) => (id === msg.id ? null : id));
      }, 1600);
    } catch {
      toast.error("Could not copy");
    }
  }

  function rateAnswer(msg: Message, next: "up" | "down") {
    const feedback: MessageFeedback = msg.feedback === next ? null : next;
    setMessages((list) =>
      list.map((m) => (m.id === msg.id ? { ...m, feedback } : m)),
    );

    if (msg.ephemeral) {
      toast.success(
        feedback === "up"
          ? "Thanks for the feedback"
          : feedback === "down"
            ? "Thanks — noted"
            : "Feedback cleared",
      );
      return;
    }

    startTransition(async () => {
      try {
        await rateChatMessageAction(msg.id, feedback);
        toast.success(
          feedback === "up"
            ? "Thanks for the feedback"
            : feedback === "down"
              ? "Thanks — noted"
              : "Feedback cleared",
        );
      } catch {
        setMessages((list) =>
          list.map((m) =>
            m.id === msg.id ? { ...m, feedback: msg.feedback ?? null } : m,
          ),
        );
        toast.error("Could not save feedback");
      }
    });
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
      ephemeral: true,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        sources: [],
        actions: [],
        feedback: null,
        ephemeral: true,
      },
    ]);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          threadId: threadId ?? undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        const errMsg = data?.error ?? "Something went wrong.";
        toast.error(errMsg);
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId ? { ...msg, content: errMsg } : msg,
          ),
        );
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";
      let sources: Source[] = [];
      let actions: AgentAction[] = [];
      let wroteSomething = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          let event: StreamEvent;
          try {
            event = JSON.parse(trimmed) as StreamEvent;
          } catch {
            continue;
          }

          if (event.type === "meta") {
            setThreadId(event.threadId);
          } else if (event.type === "action") {
            actions = [...actions, event.action];
            wroteSomething = true;
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content, sources, actions }
                  : msg,
              ),
            );
          } else if (event.type === "text") {
            content += event.text;
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      content,
                      sources: citedSources(content, sources),
                      actions,
                    }
                  : msg,
              ),
            );
          } else if (event.type === "sources") {
            sources = event.sources ?? [];
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      content,
                      sources: citedSources(content, sources),
                      actions,
                    }
                  : msg,
              ),
            );
          }
        }
      }

      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId ? { ...msg, content, sources, actions } : msg,
        ),
      );
      refreshThreads();
      if (wroteSomething) router.refresh();
      // Sync DB message ids so like/dislike can persist
      const nextThread =
        res.headers.get("X-ValleyNote-Thread") ?? threadId;
      if (nextThread) {
        try {
          const thread = await getChatThreadAction(nextThread);
          if (thread) {
            setThreadId(thread.id);
            setMessages(
              thread.messages.map((m) => {
                const parsed = parseCitations(m.citations);
                return {
                  id: m.id,
                  role: m.role as "user" | "assistant",
                  content: m.content,
                  sources: citedSources(m.content, parsed.sources),
                  actions: parsed.actions,
                  feedback: parsed.feedback ?? null,
                  ephemeral: false,
                };
              }),
            );
          }
        } catch {
          /* keep streamed messages */
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: "Network error. Please try again." }
            : msg,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (bootstrapped.current) return;
    if (!initialQ) return;
    bootstrapped.current = true;
    void ask(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  function newChat() {
    setThreadId(null);
    setMessages([]);
    setInput("");
    setHistoryOpen(false);
    setMenuOpenId(null);
    setRenamingId(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function startRename(thread: ThreadListItem) {
    setMenuOpenId(null);
    setRenamingId(thread.id);
    setRenameValue(thread.title || "Chat");
  }

  function commitRename(threadId: string) {
    const next = renameValue.trim();
    if (!next) {
      setRenamingId(null);
      return;
    }
    startTransition(async () => {
      try {
        await renameChatThreadAction(threadId, next);
        setThreads((list) =>
          list.map((t) => (t.id === threadId ? { ...t, title: next } : t)),
        );
        toast.success("Chat renamed");
      } catch {
        toast.error("Could not rename chat");
      } finally {
        setRenamingId(null);
      }
    });
  }

  function togglePin(thread: ThreadListItem) {
    setMenuOpenId(null);
    startTransition(async () => {
      try {
        const result = await togglePinChatThreadAction(thread.id);
        setThreads((list) => {
          const next = list.map((t) =>
            t.id === thread.id
              ? { ...t, pinnedAt: result.pinned ? new Date() : null }
              : t,
          );
          return next.sort((a, b) => {
            const aPinned = a.pinnedAt ? 1 : 0;
            const bPinned = b.pinnedAt ? 1 : 0;
            if (aPinned !== bPinned) return bPinned - aPinned;
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          });
        });
        toast.success(result.pinned ? "Chat pinned" : "Chat unpinned");
      } catch {
        toast.error("Could not update pin");
      }
    });
  }

  function deleteThread(id: string) {
    setMenuOpenId(null);
    startTransition(async () => {
      try {
        await deleteChatThreadAction(id);
        setThreads((list) => list.filter((t) => t.id !== id));
        if (threadId === id) newChat();
        toast.success("Chat deleted");
      } catch {
        toast.error("Could not delete chat");
      }
    });
  }

  const empty = messages.length === 0;

  return (
    <div className="relative flex h-full min-h-0">
      {/* History panel */}
      <aside
        className={`chat-history-panel absolute inset-y-3 left-3 z-20 flex w-[248px] flex-col overflow-hidden rounded-[22px] border bg-[#faf9f7] md:static md:my-3 md:mr-0 md:h-[calc(100%-1.5rem)] ${
          historyOpen
            ? "pointer-events-auto translate-x-0 border-bg-border opacity-100 shadow-[0_12px_40px_rgba(26,26,26,0.08)]"
            : "pointer-events-none -translate-x-[110%] border-transparent opacity-0 shadow-none"
        } ${
          !empty || historyOpen
            ? "md:pointer-events-auto md:ml-3 md:w-[248px] md:translate-x-0 md:border-bg-border md:opacity-100 md:shadow-[0_12px_40px_rgba(26,26,26,0.08)]"
            : "md:pointer-events-none md:ml-0 md:w-0 md:min-w-0 md:translate-x-0 md:border-transparent md:opacity-0 md:shadow-none"
        }`}
      >
        <div className="flex items-center justify-between bg-[#faf9f7] px-3 py-2.5">
          <p className="font-inter-tight text-[16px] font-bold tracking-[-0.02em] text-ink">
            Chats
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={newChat}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-bg-border bg-[#faf9f7] text-ink transition hover:border-blue hover:text-blue"
              title="New chat"
            >
              <MessageSquarePlus size={15} strokeWidth={1.85} />
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-bg-border bg-[#faf9f7] text-muted transition hover:border-blue hover:text-ink md:hidden"
              title="Close"
            >
              <X size={15} strokeWidth={1.85} />
            </button>
          </div>
        </div>
        <div className="flex-1 space-y-1.5 overflow-auto bg-[#faf9f7] px-2.5 pb-2.5 pt-0.5">
          {threads.length === 0 && !pending ? (
            <div className="rounded-[12px] border border-dashed border-bg-border bg-white px-3 py-5 text-center">
              <p className="font-switzer text-[13px] font-medium text-ink">
                No chats yet
              </p>
              <p className="mt-1 font-switzer text-[12px] text-muted">
                Start asking to save a thread here.
              </p>
            </div>
          ) : null}
          {threads.map((t) => {
            const pinned = Boolean(t.pinnedAt);
            const isMenuOpen = menuOpenId === t.id;
            const isRenaming = renamingId === t.id;

            return (
              <div
                key={t.id}
                className={`group relative flex items-center gap-0.5 rounded-[12px] border bg-[#faf9f7] transition ${
                  threadId === t.id
                    ? "border-blue shadow-[0_2px_10px_rgba(55,69,241,0.08)]"
                    : "border-bg-border/35 hover:border-blue"
                }`}
              >
                {isRenaming ? (
                  <form
                    className="min-w-0 flex-1 px-2 py-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      commitRename(t.id);
                    }}
                  >
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => commitRename(t.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          e.preventDefault();
                          setRenamingId(null);
                        }
                      }}
                      className="w-full rounded-lg border border-blue/30 bg-white px-2 py-1 font-switzer text-[13px] text-ink outline-none"
                      maxLength={80}
                    />
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => void loadThread(t.id)}
                    className={`min-w-0 flex-1 px-2.5 py-1.5 text-left font-switzer text-[13px] ${
                      threadId === t.id
                        ? "font-semibold text-ink"
                        : "font-medium text-ink"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {pinned ? (
                        <Pin
                          size={11}
                          strokeWidth={2}
                          className="shrink-0 text-blue"
                        />
                      ) : null}
                      <span className="block truncate">{t.title || "Chat"}</span>
                    </span>
                  </button>
                )}

                {!isRenaming ? (
                  <div
                    className="relative mr-0.5 shrink-0"
                    ref={isMenuOpen ? menuRef : undefined}
                  >
                    <button
                      type="button"
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-muted transition hover:text-ink ${
                        isMenuOpen
                          ? "text-ink opacity-100"
                          : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                      }`}
                      aria-label="Chat options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(isMenuOpen ? null : t.id);
                      }}
                    >
                      <MoreHorizontal size={14} strokeWidth={1.85} />
                    </button>

                    {isMenuOpen ? (
                      <div className="absolute right-0 top-8 z-30 w-[148px] overflow-hidden rounded-[12px] border border-bg-border bg-white py-0.5 shadow-[0_12px_32px_rgba(26,26,26,0.12)]">
                        <button
                          type="button"
                          className="group/menu flex w-full items-center gap-1.5 px-2.5 py-1 text-left font-switzer text-[13px] font-medium text-ink transition hover:font-bold"
                          onClick={() => startRename(t)}
                        >
                          <Pencil
                            size={12}
                            strokeWidth={1.85}
                            className="transition-[stroke-width] group-hover/menu:[stroke-width:2.4]"
                          />
                          Rename
                        </button>
                        <button
                          type="button"
                          className="group/menu flex w-full items-center gap-1.5 px-2.5 py-1 text-left font-switzer text-[13px] font-medium text-ink transition hover:font-bold"
                          onClick={() => togglePin(t)}
                        >
                          {pinned ? (
                            <PinOff
                              size={12}
                              strokeWidth={1.85}
                              className="transition-[stroke-width] group-hover/menu:[stroke-width:2.4]"
                            />
                          ) : (
                            <Pin
                              size={12}
                              strokeWidth={1.85}
                              className="transition-[stroke-width] group-hover/menu:[stroke-width:2.4]"
                            />
                          )}
                          {pinned ? "Unpin" : "Pin"}
                        </button>
                        <button
                          type="button"
                          className="group/menu flex w-full items-center gap-1.5 px-2.5 py-1 text-left font-switzer text-[13px] font-medium text-red-600 transition hover:font-bold hover:text-red-700"
                          onClick={() => deleteThread(t.id)}
                        >
                          <Trash2
                            size={12}
                            strokeWidth={1.85}
                            className="transition-[stroke-width] group-hover/menu:[stroke-width:2.4]"
                          />
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </aside>

      <button
        type="button"
        className={`chat-history-backdrop absolute inset-0 z-10 bg-ink/25 md:hidden ${
          historyOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-label="Close history"
        tabIndex={historyOpen ? 0 : -1}
        onClick={() => setHistoryOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-1.5 px-4 pt-3 md:hidden">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-bg-border bg-white px-3 font-switzer text-[12.5px] font-medium text-ink transition hover:bg-bg-soft"
          >
            <PanelLeft size={14} strokeWidth={1.85} />
            Chats
          </button>
        </div>

        <div
          className={`flex min-h-0 flex-1 flex-col ${
            empty ? "justify-center" : ""
          }`}
        >
          {empty ? (
            <div className="flex w-full flex-col items-center px-4 pb-8 pt-2 md:px-8">
              <div className="flex w-full max-w-[640px] flex-col items-center">
                <h1 className="ask-hero-enter font-inter-tight text-[28px] font-semibold tracking-[-0.04em] text-ink md:text-[34px]">
                  What do you want from your notes?
                </h1>
                <p className="ask-hero-enter mt-2 max-w-md text-center font-switzer text-[14.5px] text-muted">
                  Ask, create, edit, or organize across your notebooks.
                </p>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 md:px-8">
                {messages.map((msg, msgIndex) => {
                  const isLast = msgIndex === messages.length - 1;
                  const showActions =
                    msg.role === "assistant" &&
                    Boolean(msg.content.trim()) &&
                    !(loading && isLast);

                  return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-[20px] px-4 py-3 font-switzer text-[15px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue text-white shadow-[0_10px_24px_rgba(55,69,241,0.25)]"
                          : "border border-bg-border bg-white text-ink shadow-[0_8px_24px_rgba(26,26,26,0.03)]"
                      }`}
                    >
                      {msg.role === "assistant" &&
                      msg.actions &&
                      msg.actions.length > 0 ? (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {msg.actions.map((action, i) => {
                            const href = actionHref(action);
                            const chip = (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green/15 px-2.5 py-1 text-[12px] font-medium text-[#2f7a3e]">
                                <Check size={12} strokeWidth={2.2} />
                                {action.label}
                              </span>
                            );
                            return href ? (
                              <Link
                                key={`${action.type}-${i}`}
                                href={href}
                                className="transition hover:opacity-80"
                              >
                                {chip}
                              </Link>
                            ) : (
                              <span key={`${action.type}-${i}`}>{chip}</span>
                            );
                          })}
                        </div>
                      ) : null}

                      {msg.content ? (
                        msg.role === "assistant" ? (
                          <ChatMarkdown content={msg.content} />
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )
                      ) : loading ? (
                        <span className="inline-flex items-center gap-2 text-muted">
                          <Sparkles
                            size={14}
                            className="animate-pulse text-blue"
                          />
                          Working…
                        </span>
                      ) : null}

                    {msg.role === "assistant" &&
                    citedSources(msg.content, msg.sources).length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-bg-line pt-3">
                        {citedSources(msg.content, msg.sources).map((s) => (
                          <Link
                            key={s.id}
                            href={`/app/n/${s.id}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-bg-soft px-2.5 py-1 text-[12px] font-medium text-blue transition hover:bg-blue/10"
                          >
                            <FileText size={12} strokeWidth={1.75} />
                            [{s.index}] {s.title}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    </div>

                    {showActions ? (
                      <div className="mt-1.5 flex items-center gap-0 px-0.5">
                        <button
                          type="button"
                          onClick={() => void copyAnswer(msg)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-bg-soft hover:text-ink"
                          title="Copy"
                          aria-label="Copy answer"
                        >
                          {copiedId === msg.id ? (
                            <CheckCheck size={14} strokeWidth={1.85} className="text-blue" />
                          ) : (
                            <Copy size={14} strokeWidth={1.85} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => rateAnswer(msg, "up")}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-bg-soft ${
                            msg.feedback === "up"
                              ? "bg-blue/10 text-blue"
                              : "text-muted hover:text-ink"
                          }`}
                          title="Good response"
                          aria-label="Like answer"
                          aria-pressed={msg.feedback === "up"}
                        >
                          <ThumbsUp
                            size={14}
                            strokeWidth={1.85}
                            fill={msg.feedback === "up" ? "currentColor" : "none"}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => rateAnswer(msg, "down")}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-bg-soft ${
                            msg.feedback === "down"
                              ? "bg-orange/15 text-[#b45309]"
                              : "text-muted hover:text-ink"
                          }`}
                          title="Bad response"
                          aria-label="Dislike answer"
                          aria-pressed={msg.feedback === "down"}
                        >
                          <ThumbsDown
                            size={14}
                            strokeWidth={1.85}
                            fill={
                              msg.feedback === "down" ? "currentColor" : "none"
                            }
                          />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </div>
          )}

          {/* One composer: centered before chat, bottom after — no top border */}
          <div
            className={`shrink-0 px-4 md:px-8 ${
              empty ? "pb-6 pt-2" : "bg-transparent pb-5 pt-2"
            }`}
          >
            <div
              className={`mx-auto w-full ${empty ? "max-w-[640px]" : "max-w-3xl"}`}
            >
              <form
                onSubmit={onSubmit}
                className={`agent-ask w-full rounded-[22px] ${
                  empty ? "ask-hero-enter p-2.5 sm:p-3" : "px-3.5 py-2.5"
                }`}
              >
                {empty ? (
                  <>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void ask(input);
                        }
                      }}
                      rows={2}
                      placeholder="Ask anything about your notes…"
                      className="min-h-[56px] w-full resize-none bg-transparent px-2.5 pt-1.5 font-switzer text-[15.5px] leading-relaxed text-ink outline-none placeholder:text-muted"
                    />
                    <div className="mt-1 flex items-center justify-between gap-2 px-1">
                      <div className="flex items-center gap-1.5">
                        <VoiceInputButton
                          disabled={loading}
                          size="sm"
                          className="bg-blue/10 text-blue hover:bg-blue/15"
                          onTranscript={(text) => {
                            setInput(text);
                            void ask(text);
                          }}
                        />
                        <span className="hidden font-switzer text-[12px] text-muted sm:inline">
                          Read & write · cites your notes
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue text-white shadow-[0_8px_20px_rgba(55,69,241,0.28)] transition hover:scale-105 disabled:opacity-45"
                        aria-label="Send"
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ArrowUp size={16} strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[40px] items-center gap-2.5 sm:gap-3">
                    <VoiceInputButton
                      disabled={loading}
                      size="sm"
                      className="shrink-0 bg-blue/10 text-blue hover:bg-blue/15"
                      onTranscript={(text) => {
                        setInput(text);
                        void ask(text);
                      }}
                    />
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void ask(input);
                        }
                      }}
                      rows={1}
                      placeholder="Ask or tell the agent what to do…"
                      className="max-h-32 min-h-[40px] min-w-0 flex-1 resize-none bg-transparent py-2 font-switzer text-[15px] leading-[24px] text-ink outline-none placeholder:text-muted"
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue text-white shadow-[0_8px_20px_rgba(55,69,241,0.28)] transition hover:scale-105 disabled:opacity-50"
                      aria-label="Send"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ArrowUp size={16} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                )}
              </form>

              {empty ? (
                <div className="ask-hero-enter mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                  {SUGGESTIONS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => void ask(s.prompt)}
                        className="inline-flex items-center gap-1.5 font-switzer text-[13px] text-muted transition hover:text-ink"
                      >
                        <Icon
                          size={14}
                          strokeWidth={1.85}
                          className="text-blue/80"
                        />
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
