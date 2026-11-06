"use client";

import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import type { Editor } from "@tiptap/react";
import { ImagePlus, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { insertImageFile, insertVideoFromUrl } from "@/components/editor/media";
import VoiceRecorder from "@/components/editor/VoiceRecorder";

export type MediaToolbarHandle = {
  pickImage: () => void;
  embedVideo: () => void;
};

const MediaToolbar = forwardRef<
  MediaToolbarHandle,
  {
    editor: Editor | null;
    noteId: string;
    embedded?: boolean;
  }
>(function MediaToolbar({ editor, noteId, embedded = false }, ref) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onPickImage(file: File | null) {
    if (!editor || !file) return;
    setBusy(true);
    try {
      await insertImageFile(editor, noteId, file);
      toast.success("Image added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onEmbedVideo() {
    if (!editor) return;
    const url = window.prompt("Paste a YouTube, Vimeo, or Loom link");
    if (!url) return;
    if (!insertVideoFromUrl(editor, url)) {
      toast.error("Couldn’t recognize that video link");
      return;
    }
    toast.success("Video embedded");
  }

  useImperativeHandle(ref, () => ({
    pickImage: () => fileRef.current?.click(),
    embedVideo: onEmbedVideo,
  }));

  useEffect(() => {
    function onCmd(e: Event) {
      const detail = (e as CustomEvent<{ action?: string }>).detail;
      if (detail?.action === "insert-image") fileRef.current?.click();
      if (detail?.action === "embed-video") onEmbedVideo();
    }
    window.addEventListener("valleynote:media", onCmd);
    return () => window.removeEventListener("valleynote:media", onCmd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const body = (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
      />
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-switzer text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
            Insert media
          </p>
          <p className="mt-0.5 font-switzer text-[13px] text-muted">
            Drop an image, paste a video link, or record a voice note.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!editor || busy}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-2xl border border-bg-border bg-white px-3.5 py-2.5 font-switzer text-[13px] font-medium text-ink transition hover:border-blue/35 hover:bg-blue/[0.03] disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin text-blue" />
          ) : (
            <ImagePlus size={15} strokeWidth={1.85} className="text-blue" />
          )}
          Image
        </button>
        <button
          type="button"
          disabled={!editor || busy}
          onClick={onEmbedVideo}
          className="inline-flex items-center gap-2 rounded-2xl border border-bg-border bg-white px-3.5 py-2.5 font-switzer text-[13px] font-medium text-ink transition hover:border-blue/35 hover:bg-blue/[0.03] disabled:opacity-50"
        >
          <Link2 size={15} strokeWidth={1.85} className="text-blue" />
          Embed video
        </button>
        <VoiceRecorder editor={editor} noteId={noteId} />
      </div>
    </>
  );

  if (embedded) return <div className="note-tools-panel">{body}</div>;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-bg-line/80 bg-white/50 px-5 py-2 md:px-8">
      {body}
    </div>
  );
});

export default MediaToolbar;
