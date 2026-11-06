import { Trash2 } from "lucide-react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { jsonToPlainText } from "@/lib/notes";
import { TrashActions } from "@/components/app/TrashActions";
import AppTopBar from "@/components/app/AppTopBar";
import NotebookIcon from "@/components/app/NotebookIcon";

export const metadata = { title: "Trash — ValleyNote" };

const RETENTION_DAYS = 30;

function formatDeletedAt(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function daysLeft(deletedAt: Date) {
  const elapsed = Date.now() - deletedAt.getTime();
  const remaining =
    RETENTION_DAYS - Math.floor(elapsed / (24 * 60 * 60 * 1000));
  return Math.max(0, remaining);
}

export default async function TrashPage() {
  const session = await requireSession();
  const notes = await prisma.note.findMany({
    where: { userId: session.user.id, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    include: {
      notebook: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  return (
    <div className="flex min-h-full flex-col">
      <AppTopBar
        title="Trash"
        subtitle="Deleted notes stay here for 30 days. Restore anytime before they’re gone."
        hideActions
      />

      <div className="w-full flex-1 px-4 py-5 md:px-7 md:py-6">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center rounded-[28px] border border-bg-border bg-white px-6 py-20 text-center shadow-[0_8px_24px_rgba(26,26,26,0.03)]">
            <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-red-50 text-red-600">
              <Trash2 size={26} strokeWidth={1.65} />
            </span>
            <p className="mt-5 font-inter-tight text-[20px] font-semibold tracking-[-0.02em] text-ink">
              Trash is empty
            </p>
            <p className="mt-2 max-w-md font-switzer text-[14px] text-muted">
              When you delete a note, it shows up here for 30 days so you can
              bring it back if you need to.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between px-1">
              <p className="font-switzer text-[13.5px] font-medium text-muted">
                {notes.length} deleted note{notes.length === 1 ? "" : "s"}
              </p>
            </div>

            <ul className="grid gap-3">
              {notes.map((note) => {
                const deletedAt = note.deletedAt ?? new Date();
                const remaining = daysLeft(deletedAt);
                const content =
                  (note.contentText || "").trim() ||
                  jsonToPlainText(note.contentJson).trim();

                return (
                  <li
                    key={note.id}
                    className="rounded-[24px] border border-bg-border bg-white p-5 shadow-[0_8px_24px_rgba(26,26,26,0.03)] transition hover:border-blue/20 hover:shadow-[0_14px_32px_rgba(55,69,241,0.06)] md:p-6"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 flex-1 items-start gap-4 md:gap-5">
                        <NotebookIcon
                          id={note.notebook.id}
                          color={note.notebook.color}
                          size={52}
                          tone="danger"
                        />
                        <div className="min-w-0 flex-1 pt-0.5">
                          <h3 className="truncate font-inter-tight text-[18px] font-semibold tracking-[-0.02em] text-ink md:text-[20px]">
                            {note.title || "Untitled"}
                          </h3>
                          <p className="mt-1.5 font-switzer text-[14px] text-muted">
                            {note.notebook.name}
                            <span className="mx-1.5 text-bg-border">·</span>
                            Deleted {formatDeletedAt(deletedAt)}
                            <span className="mx-1.5 text-bg-border">·</span>
                            <span
                              className={
                                remaining <= 7
                                  ? "font-medium text-[#b45309]"
                                  : undefined
                              }
                            >
                              {remaining === 0
                                ? "Gone today"
                                : `${remaining} day${remaining === 1 ? "" : "s"} left`}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 sm:self-center">
                        <TrashActions
                          noteId={note.id}
                          title={note.title}
                          notebookName={note.notebook.name}
                          content={content}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
