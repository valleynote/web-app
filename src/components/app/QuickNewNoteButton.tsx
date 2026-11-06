"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createNoteInDefaultNotebookAction } from "@/server/actions/notebooks";

export function QuickNewNoteButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
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
      className={`inline-flex items-center gap-1.5 rounded-full bg-blue font-switzer font-medium text-white shadow-[0_8px_20px_rgba(55,69,241,0.25)] transition hover:bg-blue/90 disabled:opacity-60 ${
        compact ? "px-3 py-1.5 text-[12px]" : "h-10 px-4 text-[13px]"
      }`}
    >
      <Plus size={compact ? 13 : 15} strokeWidth={2} />
      {pending ? "Creating…" : "New note"}
    </button>
  );
}
