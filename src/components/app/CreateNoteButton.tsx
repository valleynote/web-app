"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createNoteAction } from "@/server/actions/notebooks";

export function CreateNoteButton({ notebookId }: { notebookId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            const note = await createNoteAction(notebookId);
            toast.success("Note created");
            router.push(`/app/n/${note.id}`);
            router.refresh();
          } catch {
            toast.error("Could not create note");
          }
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-[11px] bg-blue px-4 py-2.5 font-switzer text-[13px] font-medium text-white shadow-[0_8px_20px_rgba(55,69,241,0.25)] disabled:opacity-60"
    >
      <Plus size={15} strokeWidth={2} />
      {pending ? "Creating…" : "New note"}
    </button>
  );
}
