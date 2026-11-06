"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle, Color, FontSize } from "@tiptap/extension-text-style";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  Redo2,
  Star,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { toggleFavoriteAction } from "@/server/actions/notebooks";
import { readingTimeMinutes } from "@/lib/notes";
import { plainCloneJson } from "@/lib/tiptap-json";
import { looksLikeVideoUrl } from "@/lib/video-url";
import { registerNoteCommands } from "@/lib/note-commands";
import NoteToolsBar, {
  type NoteToolsTab,
} from "@/components/editor/NoteToolsBar";
import { useNoteChrome } from "@/components/editor/NoteChromeContext";
import NoteTagsRow from "@/components/editor/NoteTagsRow";
import NoteHistoryPanel from "@/components/editor/NoteHistoryPanel";
import DeleteNoteModal from "@/components/editor/DeleteNoteModal";
import SelectionToolbar from "@/components/editor/SelectionToolbar";
import VoiceRecorder from "@/components/editor/VoiceRecorder";
import { bumpSelectionFontSize } from "@/components/editor/fontSize";
import type { MediaToolbarHandle } from "@/components/editor/MediaToolbar";
import type { AgentPanelHandle } from "@/components/editor/AgentPanel";
import { VideoEmbed } from "@/components/editor/extensions/VideoEmbed";
import {
  insertImageFile,
  insertVideoFromUrl,
  isImageFile,
} from "@/components/editor/media";
type Props = {
  noteId: string;
  initialTitle: string;
  initialContent: unknown;
  initialVersion: number;
  initialWordCount: number;
  initialFavorite?: boolean;
};

export default function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
  initialVersion,
  initialWordCount,
  initialFavorite = false,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [version, setVersion] = useState(initialVersion);
  const [status, setStatus] = useState<"saved" | "saving" | "unsaved" | "conflict">(
    "saved",
  );
  const [wordCount, setWordCount] = useState(initialWordCount);
  const [favorite, setFavorite] = useState(initialFavorite);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [toolsTab, setToolsTab] = useState<NoteToolsTab | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIdRef = useRef(noteId);
  const editorRef = useRef<Editor | null>(null);
  const mediaRef = useRef<MediaToolbarHandle | null>(null);
  const agentRef = useRef<AgentPanelHandle | null>(null);
  const router = useRouter();
  const chrome = useNoteChrome();

  useEffect(() => {
    noteIdRef.current = noteId;
  }, [noteId]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        undoRedo: {
          depth: 200,
        },
      }),
      Placeholder.configure({
        placeholder: "Type, paste a video link, or drop an image…",
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "note-link",
        },
      }),
      TextStyle.configure({
        mergeNestedSpanStyles: true,
      }),
      Color,
      FontSize,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "note-image",
        },
      }),
      VideoEmbed,
    ],
    content: initialContent as object,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-valley min-h-[50vh] outline-none font-switzer text-[16px] leading-relaxed text-ink",
      },
      handlePaste: (_view, event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;
        const current = editorRef.current;
        if (!current) return false;

        const files = Array.from(clipboard.files).filter(isImageFile);
        if (files.length > 0) {
          event.preventDefault();
          void (async () => {
            try {
              for (const file of files) {
                await insertImageFile(current, noteIdRef.current, file);
              }
              toast.success(files.length > 1 ? "Images added" : "Image added");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Upload failed");
            }
          })();
          return true;
        }

        const text = clipboard.getData("text/plain").trim();
        if (text && looksLikeVideoUrl(text) && !text.includes("\n")) {
          event.preventDefault();
          if (insertVideoFromUrl(current, text)) {
            toast.success("Video embedded");
            return true;
          }
        }

        return false;
      },
      handleDrop: (_view, event) => {
        const current = editorRef.current;
        if (!current) return false;
        const files = Array.from(event.dataTransfer?.files ?? []).filter(isImageFile);
        if (!files.length) return false;
        event.preventDefault();
        void (async () => {
          try {
            for (const file of files) {
              await insertImageFile(current, noteIdRef.current, file);
            }
            toast.success(files.length > 1 ? "Images added" : "Image added");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
          }
        })();
        return true;
      },
    },
    onCreate: ({ editor: ed }) => {
      editorRef.current = ed;
      setCanUndo(ed.can().undo());
      setCanRedo(ed.can().redo());
    },
    onTransaction: ({ editor: ed }) => {
      setCanUndo(ed.can().undo());
      setCanRedo(ed.can().redo());
    },
    onUpdate: () => {
      setStatus("unsaved");
      scheduleSave();
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    chrome.register({
      noteId,
      editor,
      toolsTab,
      setToolsTab,
    });
    return () => chrome.unregister();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, editor, toolsTab]);

  function undoEdit() {
    const ed = editorRef.current;
    if (!ed?.can().undo()) return;
    ed.chain().focus().undo().run();
  }

  function redoEdit() {
    const ed = editorRef.current;
    if (!ed?.can().redo()) return;
    ed.chain().focus().redo().run();
  }

  const saveSnapshot = useRef({ title, version, noteId, editor });

  useEffect(() => {
    saveSnapshot.current = { title, version, noteId, editor };
  }, [title, version, noteId, editor]);

  async function persist() {
    const snap = saveSnapshot.current;
    if (!snap.editor) return;
    setStatus("saving");
    try {
      // JSON API + plain clone keeps mark/node attrs (color, fontSize,
      // highlight, link href, image/video src) — Server Actions can drop them.
      const contentJson = plainCloneJson(snap.editor.getJSON());
      const res = await fetch("/api/notes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: snap.noteId,
          title: snap.title,
          contentJson,
          version: snap.version,
        }),
      });
      const result = (await res.json()) as {
        conflict?: boolean;
        version?: number;
        wordCount?: number;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(result.error ?? "Could not save note");
      }

      if (result.conflict) {
        setStatus("conflict");
        setConflictMsg(
          "This note was edited in another tab. Reload to get the latest version, or keep typing to overwrite after refresh.",
        );
        return;
      }

      if (typeof result.version === "number") setVersion(result.version);
      if (typeof result.wordCount === "number") setWordCount(result.wordCount);
      setStatus("saved");
      setConflictMsg(null);
    } catch (err) {
      setStatus("unsaved");
      const message =
        err instanceof Error ? err.message : "Could not save note";
      setConflictMsg(message);
      toast.error(message);
    }
  }

  function scheduleSave() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void persist();
    }, 700);
  }

  const persistRef = useRef(persist);
  persistRef.current = persist;

  useEffect(() => {
    function flush() {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      void persistRef.current();
    }
    function onLeave() {
      if (saveSnapshot.current.editor) flush();
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") onLeave();
    }
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  async function summarize() {
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      const data = (await res.json()) as {
        summary?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Summarize failed");
      setSummary(data.summary ?? null);
      toast.success("Summary ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Summarize failed";
      setConflictMsg(message);
      toast.error(message);
    }
  }

  function toggleFavorite() {
    setFavorite((v) => !v);
    void toggleFavoriteAction(noteId).then(() => router.refresh());
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    registerNoteCommands({
      save: () => void persist(),
      undo: () => undoEdit(),
      redo: () => redoEdit(),
      history: () => setHistoryOpen((v) => !v),
      summarize: () => void summarize(),
      favorite: () => toggleFavorite(),
      "auto-title": () => {
        setToolsTab("organize");
        void agentRef.current?.autoTitle();
      },
      "auto-tag": () => {
        setToolsTab("organize");
        void agentRef.current?.autoTag();
      },
      tasks: () => {
        setToolsTab("organize");
        void agentRef.current?.turnIntoTasks();
      },
      related: () => {
        setToolsTab("organize");
        void agentRef.current?.findRelated();
      },
      "insert-image": () => {
        setToolsTab("media");
        queueMicrotask(() => mediaRef.current?.pickImage());
      },
      "embed-video": () => {
        setToolsTab("media");
        queueMicrotask(() => mediaRef.current?.embedVideo());
      },
      "voice-note": () => setToolsTab("media"),
      "open-ai": () => setToolsTab((t) => (t === "ai" ? null : "ai")),
      "open-media": () => setToolsTab((t) => (t === "media" ? null : "media")),
      "open-organize": () =>
        setToolsTab((t) => (t === "organize" ? null : "organize")),
    });
    return () => registerNoteCommands(null);
    // Handlers read latest values via refs / stable noteId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) {
        if (e.key === "Escape" && toolsTab) {
          e.preventDefault();
          setToolsTab(null);
        }
        return;
      }

      const key = e.key.toLowerCase();
      const target = e.target as HTMLElement | null;
      const inNativeField =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if (key === "s") {
        e.preventDefault();
        void persist();
        return;
      }

      if (key === "k") return; // command palette owns this

      // Local undo / redo (leave native undo for title input)
      if (key === "z" && !inNativeField) {
        e.preventDefault();
        if (e.shiftKey) redoEdit();
        else undoEdit();
        return;
      }
      if (key === "y" && !e.shiftKey && !inNativeField) {
        e.preventDefault();
        redoEdit();
        return;
      }

      // Font size for selected text: ⌘+ / ⌘−
      if (
        !inNativeField &&
        editorRef.current &&
        !editorRef.current.state.selection.empty &&
        (key === "=" || key === "+" || key === "-")
      ) {
        e.preventDefault();
        bumpSelectionFontSize(
          editorRef.current,
          key === "-" ? -1 : 1,
        );
        return;
      }

      if (!e.shiftKey) return;

      const map: Record<string, () => void> = {
        a: () => setToolsTab((t) => (t === "ai" ? null : "ai")),
        i: () => setToolsTab((t) => (t === "media" ? null : "media")),
        o: () => setToolsTab((t) => (t === "organize" ? null : "organize")),
        h: () => setHistoryOpen((v) => !v),
        t: () => {
          setToolsTab("organize");
          void agentRef.current?.autoTitle();
        },
        g: () => {
          setToolsTab("organize");
          void agentRef.current?.autoTag();
        },
        m: () => void summarize(),
        l: () => {
          setToolsTab("organize");
          void agentRef.current?.turnIntoTasks();
        },
        r: () => {
          setToolsTab("organize");
          void agentRef.current?.findRelated();
        },
      };

      const action = map[key];
      if (!action) return;
      e.preventDefault();
      action();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolsTab]);

  return (
    <div className="flex h-full flex-col bg-[#faf9f7]">
      {conflictMsg ? (
        <div className="border-b border-orange/30 bg-orange/10 px-4 py-3 font-switzer text-[13px] text-ink md:px-7">
          {conflictMsg}
        </div>
      ) : null}

      <NoteToolsBar
        editor={editor}
        noteId={noteId}
        title={title}
        onTitleChange={setTitle}
        onVersion={setVersion}
        openTab={toolsTab}
        onOpenTab={setToolsTab}
        mediaRef={mediaRef}
        agentRef={agentRef}
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="note-editor-scroll min-w-0 flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setStatus("unsaved");
                scheduleSave();
              }}
              className="w-full bg-transparent font-inter-tight text-[34px] font-semibold tracking-[-0.03em] text-ink outline-none placeholder:text-muted"
              placeholder="Untitled"
            />

            <NoteTagsRow noteId={noteId} />

            {!title || title === "Untitled" ? (
              <p className="mt-2 font-switzer text-[12px] text-muted">
                Tip: write a few lines, then{" "}
                <button
                  type="button"
                  className="font-medium text-blue underline-offset-2 hover:underline"
                  onClick={() => {
                    setToolsTab("organize");
                    void agentRef.current?.autoTitle();
                  }}
                >
                  Auto-title
                </button>{" "}
                <kbd className="rounded bg-bg-muted px-1 py-0.5 text-[10px]">
                  ⌘⇧T
                </kbd>
              </p>
            ) : null}

            {wordCount === 0 ? (
              <div className="mt-5">
                <VoiceRecorder
                  editor={editor}
                  noteId={noteId}
                  variant="card"
                />
              </div>
            ) : null}

            {summary ? (
              <div className="mt-6 overflow-hidden rounded-[22px] border border-blue/20 bg-gradient-to-br from-blue/[0.06] to-white p-4 shadow-[0_8px_24px_rgba(55,69,241,0.06)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-inter-tight text-[14px] font-semibold text-blue">
                    Summary
                  </p>
                  <button
                    type="button"
                    className="text-[12px] text-muted hover:text-ink"
                    onClick={() => setSummary(null)}
                  >
                    Dismiss
                  </button>
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-switzer text-[14px] text-ink">
                  {summary}
                </pre>
                <button
                  type="button"
                  className="mt-3 rounded-full bg-blue px-4 py-2 text-[13px] font-medium text-white"
                  onClick={() => {
                    if (!editor) return;
                    editor.commands.insertContentAt(0, {
                      type: "blockquote",
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: summary }],
                        },
                      ],
                    });
                    setSummary(null);
                  }}
                >
                  Insert at top
                </button>
              </div>
            ) : null}

            <div className="mt-6">
              {editor ? <SelectionToolbar editor={editor} /> : null}
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        <NoteHistoryPanel
          key={noteId}
          noteId={noteId}
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          onRestore={({
            title: nextTitle,
            contentJson,
            version: nextVersion,
            wordCount: nextWords,
          }) => {
            setTitle(nextTitle);
            setVersion(nextVersion);
            setWordCount(nextWords);
            setStatus("saved");
            setConflictMsg(null);
            editor?.commands.setContent(contentJson as object);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bg-line/80 bg-[#faf9f7]/90 px-4 py-2.5 backdrop-blur md:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-switzer text-[12px] font-medium text-muted">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "saved"
                  ? "bg-emerald-500"
                  : status === "saving"
                    ? "animate-pulse bg-blue"
                    : status === "conflict"
                      ? "bg-orange"
                      : "bg-amber-400"
              }`}
            />
            {status === "saving" && "Saving…"}
            {status === "saved" && "Saved"}
            {status === "unsaved" && "Unsaved"}
            {status === "conflict" && "Conflict"}
          </div>
          <span className="font-switzer text-[12px] text-muted">
            {wordCount} words · {readingTimeMinutes(wordCount)} min read
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Undo (⌘Z)"
            disabled={!canUndo}
            onClick={undoEdit}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-white disabled:opacity-35"
          >
            <Undo2 size={15} strokeWidth={1.85} />
          </button>
          <button
            type="button"
            title="Redo (⌘⇧Z)"
            disabled={!canRedo}
            onClick={redoEdit}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-white disabled:opacity-35"
          >
            <Redo2 size={15} strokeWidth={1.85} />
          </button>
          <button
            type="button"
            title="Edit history (⌘⇧H)"
            aria-pressed={historyOpen}
            onClick={() => setHistoryOpen((v) => !v)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
              historyOpen
                ? "bg-blue text-white hover:bg-blue"
                : "text-ink-soft hover:bg-white"
            }`}
          >
            <History size={15} strokeWidth={1.85} />
          </button>
          <button
            type="button"
            title={favorite ? "Unfavorite" : "Favorite"}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white ${
              favorite ? "text-[#b45309]" : "text-ink-soft"
            }`}
            onClick={() => toggleFavorite()}
          >
            <Star
              size={15}
              strokeWidth={1.85}
              fill={favorite ? "currentColor" : "none"}
            />
          </button>
          <button
            type="button"
            title="Move to trash"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-white hover:text-red-600"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={15} strokeWidth={1.85} />
          </button>
        </div>
      </div>

      <DeleteNoteModal
        noteId={noteId}
        noteTitle={title}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          setDeleteOpen(false);
          router.push("/app");
          router.refresh();
        }}
      />
    </div>
  );
}
