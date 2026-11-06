"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import VoiceInputButton from "@/components/app/VoiceInputButton";

export default function AgentAskBar({
  autofocus = false,
  large = false,
}: {
  autofocus?: boolean;
  large?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(value?: string) {
    const query = (value ?? q).trim();
    if (!query) {
      router.push("/app/chat");
      return;
    }
    router.push(`/app/chat?q=${encodeURIComponent(query)}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`agent-ask flex w-full items-center gap-2.5 ${
        large ? "min-h-[58px] rounded-[22px] px-3.5 py-2.5 md:min-h-[64px] md:px-4" : "min-h-[52px] rounded-[20px] px-3 py-2"
      }`}
    >
      <VoiceInputButton
        size="sm"
        className="bg-blue/10 text-blue hover:bg-blue/15"
        onTranscript={(text) => {
          setQ(text);
          submit(text);
        }}
      />
      <input
        type="text"
        autoFocus={autofocus}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Ask anything across all your notes…"
        className="min-w-0 flex-1 bg-transparent font-switzer text-[15px] text-ink outline-none placeholder:text-muted md:text-[16px]"
      />
      <button
        type="submit"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue text-white shadow-[0_8px_20px_rgba(55,69,241,0.28)] transition hover:scale-105 hover:bg-blue/90"
        aria-label="Ask"
      >
        <ArrowUp size={16} strokeWidth={2} />
      </button>
    </form>
  );
}
