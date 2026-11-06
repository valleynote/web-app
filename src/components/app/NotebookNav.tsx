"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createNoteAction } from "@/server/actions/notebooks";
import NotebookIcon from "@/components/app/NotebookIcon";
import { openCreateNotebookModal } from "@/components/app/CreateNotebookModal";

type Notebook = {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId: string | null;
  notes: { id: string; title: string; isFavorite: boolean }[];
};

export default function NotebookNav({ notebooks }: { notebooks: Notebook[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const roots = notebooks.filter((n) => !n.parentId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-end px-4 pb-1">
        <button
          type="button"
          disabled={pending}
          onClick={() => openCreateNotebookModal()}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-switzer text-[12px] font-medium text-[#8a857f] transition hover:bg-bg-soft hover:text-ink"
        >
          <Plus size={13} strokeWidth={1.85} />
          Add
        </button>
      </div>

      <div className="flex-1 space-y-0.5 overflow-auto px-3 pb-2">
        {roots.length === 0 ? (
          <p className="px-3 py-2 font-switzer text-[12px] text-muted">
            No notebooks yet
          </p>
        ) : null}
        {roots.map((nb) => {
          const active = pathname.includes(`/app/nb/${nb.id}`);
          return (
            <div key={nb.id} className="group flex items-center gap-0.5">
              <Link
                href={`/app/nb/${nb.id}`}
                className={`relative flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl px-3 py-[9px] text-[13px] font-medium transition ${
                  active
                    ? "bg-bg-muted font-semibold text-ink"
                    : "text-[#6b6b6b] hover:bg-bg-soft hover:text-ink"
                }`}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-blue"
                  />
                ) : null}
                <NotebookIcon id={nb.id} color={nb.color} size={22} />
                <span className="min-w-0 flex-1 truncate">{nb.name}</span>
                <span className="rounded-md bg-black/[0.04] px-1.5 py-0.5 font-switzer text-[10px] tabular-nums text-muted">
                  {nb.notes.length}
                </span>
              </Link>
              <button
                type="button"
                title="New note in notebook"
                className="rounded-lg p-1.5 text-muted opacity-0 transition hover:bg-white hover:text-ink group-hover:opacity-100"
                onClick={() => {
                  startTransition(async () => {
                    try {
                      const note = await createNoteAction(nb.id);
                      toast.success("Note created");
                      router.push(`/app/n/${note.id}`);
                      router.refresh();
                    } catch {
                      toast.error("Could not create note");
                    }
                  });
                }}
              >
                <Plus size={13} strokeWidth={1.85} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
