"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Loader2, Mic, Square } from "lucide-react";
import { toast } from "sonner";

type Props = {
  editor: Editor | null;
  noteId: string;
  onTranscript?: (text: string) => void;
  /** compact = toolbar chip · prominent = labeled header btn · header = round shell icon · card = empty-state CTA */
  variant?: "compact" | "prominent" | "header" | "card";
};

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VoiceRecorder({
  editor,
  noteId,
  onTranscript,
  variant = "compact",
}: Props) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    if (!editor || busy || recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        void finish(new Blob(chunksRef.current, { type: mime }));
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone permission is required for voice notes");
    }
  }

  function stop() {
    if (!recording) return;
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function finish(blob: Blob) {
    if (!editor) return;
    if (blob.size < 400) {
      toast.error("Recording was too short");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("audio", blob, "voice-note.webm");
      form.append("noteId", noteId);
      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        throw new Error(data.error ?? "Transcription failed");
      }
      editor
        .chain()
        .focus()
        .insertContent({
          type: "paragraph",
          content: [{ type: "text", text: data.text }],
        })
        .run();
      onTranscript?.(data.text);
      toast.success("Voice note inserted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setBusy(false);
      setSeconds(0);
    }
  }

  const label = busy
    ? "Transcribing…"
    : recording
      ? `Stop · ${formatTime(seconds)}`
      : variant === "card"
        ? "Tap to record"
        : "Voice note";

  const icon = busy ? (
    <Loader2
      size={variant === "card" ? 22 : 15}
      className="animate-spin"
    />
  ) : recording ? (
    <Square
      size={variant === "card" ? 18 : 13}
      strokeWidth={2}
      fill="currentColor"
    />
  ) : (
    <Mic size={variant === "card" ? 22 : 15} strokeWidth={1.85} />
  );

  if (variant === "card") {
    return (
      <button
        type="button"
        disabled={!editor || busy}
        onClick={() => (recording ? stop() : void start())}
        className={`group flex w-full items-center gap-4 rounded-[22px] border px-5 py-4 text-left transition disabled:opacity-50 ${
          recording
            ? "border-red-200 bg-red-50 shadow-[0_10px_28px_rgba(220,38,38,0.08)]"
            : busy
              ? "border-blue/20 bg-blue/[0.06]"
              : "border-blue/25 bg-gradient-to-br from-blue/[0.08] via-white to-white shadow-[0_10px_28px_rgba(55,69,241,0.06)] hover:border-blue/45 hover:shadow-[0_14px_32px_rgba(55,69,241,0.1)]"
        }`}
      >
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            recording
              ? "bg-red-600 text-white"
              : "bg-blue text-white shadow-[0_8px_18px_rgba(55,69,241,0.28)]"
          }`}
        >
          {recording ? (
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
          ) : (
            icon
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-inter-tight text-[16px] font-semibold tracking-[-0.02em] text-ink">
            {busy
              ? "Turning speech into text…"
              : recording
                ? `Recording · ${formatTime(seconds)}`
                : "Record a voice note"}
          </span>
          <span className="mt-0.5 block font-switzer text-[13px] text-muted">
            {busy
              ? "Hang tight — we’ll insert the transcript into your note."
              : recording
                ? "Tap again to stop and insert the transcript."
                : "Speak freely. We’ll transcribe and drop it into the note."}
          </span>
        </span>
        <span
          className={`shrink-0 rounded-full px-3.5 py-2 font-switzer text-[12.5px] font-semibold transition ${
            recording
              ? "bg-red-600 text-white"
              : "bg-blue text-white group-hover:bg-blue/90"
          }`}
        >
          {label}
        </span>
      </button>
    );
  }

  if (variant === "header") {
    return (
      <button
        type="button"
        disabled={!editor || busy}
        onClick={() => (recording ? stop() : void start())}
        title={
          busy
            ? "Transcribing…"
            : recording
              ? `Stop recording · ${formatTime(seconds)}`
              : "Voice note"
        }
        aria-label={recording ? "Stop recording" : "Record voice note"}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition disabled:opacity-50 ${
          recording
            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-50"
            : busy
              ? "border-blue/30 bg-blue/10 text-blue"
              : "border-bg-border/80 bg-white text-muted hover:border-bg-border hover:bg-bg-soft hover:text-ink"
        }`}
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" />
        ) : recording ? (
          <Square size={13} strokeWidth={2} fill="currentColor" />
        ) : (
          <Mic size={16} strokeWidth={1.75} />
        )}
      </button>
    );
  }

  if (variant === "prominent") {
    return (
      <button
        type="button"
        disabled={!editor || busy}
        onClick={() => (recording ? stop() : void start())}
        title={
          busy
            ? "Transcribing…"
            : recording
              ? `Stop recording · ${formatTime(seconds)}`
              : "Record a voice note"
        }
        className={`mr-1 inline-flex h-9 items-center gap-1.5 rounded-xl px-3 font-switzer text-[12.5px] font-semibold transition disabled:opacity-50 ${
          recording
            ? "bg-red-600 text-white hover:bg-red-600/90"
            : busy
              ? "bg-blue/10 text-blue"
              : "bg-blue text-white hover:bg-blue/90"
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
        {recording ? (
          <span className="relative ml-0.5 flex h-1.5 w-1.5 sm:hidden">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!editor || busy}
      onClick={() => (recording ? stop() : void start())}
      className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 font-switzer text-[13px] font-medium transition disabled:opacity-50 ${
        recording
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-50"
          : "border-bg-border bg-white text-ink hover:border-blue/35 hover:bg-blue/[0.03]"
      }`}
    >
      <span className={recording ? "text-red-600" : "text-blue"}>{icon}</span>
      {label}
    </button>
  );
}
