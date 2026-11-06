"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { submitFeedbackAction } from "@/server/actions/feedback";

const CATEGORIES = [
  { id: "idea" as const, label: "Idea" },
  { id: "bug" as const, label: "Bug" },
  { id: "other" as const, label: "Other" },
];

export function openFeedbackModal() {
  window.dispatchEvent(new CustomEvent("valleynote:feedback"));
}

export default function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>(
    "idea",
  );
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function onOpen() {
      setCategory("idea");
      setMessage("");
      setSent(false);
      setOpen(true);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) setOpen(false);
    }
    window.addEventListener("valleynote:feedback", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("valleynote:feedback", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, [pending]);

  function close() {
    if (pending) return;
    setOpen(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitFeedbackAction({ category, message });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSent(true);
    });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/30 px-4 py-6 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={close}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[20px] border border-bg-border bg-white shadow-[0_28px_90px_rgba(26,26,26,0.22)]">
        {sent ? (
          <div className="px-5 py-8 text-center">
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f5ec] text-[#2f7a3e]">
              <Check size={22} strokeWidth={2.2} />
            </span>
            <p
              id="feedback-title"
              className="mt-4 font-inter-tight text-[18px] font-semibold tracking-[-0.02em] text-ink"
            >
              Thanks for the feedback
            </p>
            <p className="mt-1.5 font-switzer text-[13.5px] leading-relaxed text-muted">
              We read every note. It helps us make ValleyNote better.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-ink px-5 font-switzer text-[13.5px] font-semibold text-white transition hover:bg-ink/90"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-1">
              <div>
                <p
                  id="feedback-title"
                  className="font-inter-tight text-[16px] font-semibold text-ink"
                >
                  Send feedback
                </p>
                <p className="mt-0.5 font-switzer text-[13px] text-muted">
                  Ideas, bugs, or anything else
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="rounded-full p-1.5 text-muted transition hover:bg-bg-soft hover:text-ink disabled:opacity-50"
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.85} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 px-5 pb-5 pt-5">
              <div>
                <span className="mb-1.5 block font-switzer text-[12px] font-medium text-muted">
                  Type
                </span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((item) => {
                    const active = category === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCategory(item.id)}
                        className={`rounded-full px-3.5 py-1.5 font-switzer text-[13px] font-medium transition ${
                          active
                            ? "bg-ink text-white"
                            : "bg-bg-soft text-[#6b6b6b] hover:bg-bg-muted hover:text-ink"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block font-switzer text-[12px] font-medium text-muted">
                  Message
                </span>
                <textarea
                  required
                  autoFocus
                  rows={5}
                  minLength={10}
                  maxLength={5000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What’s on your mind?"
                  className="w-full resize-none rounded-[12px] border border-bg-border bg-bg-soft px-3.5 py-2.5 font-switzer text-[15px] leading-relaxed text-ink outline-none ring-blue/30 placeholder:text-[#b0aaa3] focus:bg-white focus:ring-2"
                />
              </label>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={pending}
                  onClick={close}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-bg-border bg-white px-4 font-switzer text-[13.5px] font-semibold text-ink transition hover:bg-bg-soft disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || message.trim().length < 10}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-blue px-4 font-switzer text-[13.5px] font-semibold text-white shadow-[0_8px_20px_rgba(55,69,241,0.25)] disabled:opacity-60"
                >
                  {pending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send feedback"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
