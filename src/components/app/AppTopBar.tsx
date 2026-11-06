"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createNoteInDefaultNotebookAction } from "@/server/actions/notebooks";

export default function AppTopBar({
  title,
  subtitle,
  hideActions = false,
  actions,
}: {
  title?: string;
  subtitle?: string;
  hideActions?: boolean;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <header className="flex flex-wrap items-end justify-between gap-3 px-4 pb-1 pt-5 md:px-7 md:pt-6">
      <div className="min-w-0">
        {title ? (
          <h1 className="truncate font-inter-tight text-[26px] font-semibold tracking-[-0.03em] text-ink md:text-[30px]">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="mt-1 max-w-xl font-switzer text-[13.5px] text-muted md:text-[14px]">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : !hideActions ? (
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/app/chat"
            className="hidden h-10 items-center gap-1.5 rounded-full border border-bg-border bg-white px-4 font-switzer text-[13px] font-medium text-ink transition hover:bg-bg-soft sm:inline-flex"
          >
            <Sparkles size={14} strokeWidth={1.75} className="text-blue" />
            Ask
          </Link>
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
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 font-switzer text-[13px] font-medium text-white transition hover:bg-ink-soft disabled:opacity-60"
          >
            <Plus size={14} strokeWidth={2} />
            <span className="hidden sm:inline">New note</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      ) : null}
    </header>
  );
}
