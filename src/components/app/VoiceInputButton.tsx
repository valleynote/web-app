"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { toast } from "sonner";

type Props = {
  disabled?: boolean;
  onTranscript: (text: string) => void;
  className?: string;
  size?: "sm" | "md";
};

export default function VoiceInputButton({
  disabled,
  onTranscript,
  className = "",
  size = "md",
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
    if (disabled || busy || recording) return;
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
      toast.error("Microphone permission is required for voice input");
    }
  }

  function stop() {
    if (!recording) return;
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function finish(blob: Blob) {
    if (blob.size < 400) {
      toast.error("Recording was too short");
      setSeconds(0);
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("audio", blob, "voice-chat.webm");
      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        throw new Error(data.error ?? "Transcription failed");
      }
      onTranscript(data.text.trim());
      toast.success("Voice transcribed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setBusy(false);
      setSeconds(0);
    }
  }

  const dim = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const icon = size === "sm" ? 16 : 16;
  const stopIcon = size === "sm" ? 13 : 14;

  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={() => (recording ? stop() : void start())}
      title={
        busy
          ? "Transcribing…"
          : recording
            ? `Stop recording · ${seconds}s`
            : "Voice input"
      }
      aria-label={recording ? "Stop recording" : "Start voice input"}
      className={`flex shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${dim} ${
        recording
          ? "bg-red-500/10 text-red-600 hover:bg-red-500/15"
          : className || "text-ink-soft hover:bg-bg-soft hover:text-ink"
      }`}
    >
      {busy ? (
        <Loader2 size={icon} className="animate-spin" />
      ) : recording ? (
        <Square size={stopIcon} strokeWidth={2} fill="currentColor" />
      ) : (
        <Mic size={icon} strokeWidth={1.85} />
      )}
    </button>
  );
}
