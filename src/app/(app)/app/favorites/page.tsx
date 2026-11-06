import Link from "next/link";
import { Star } from "lucide-react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AppTopBar from "@/components/app/AppTopBar";

export const metadata = { title: "Favorites — ValleyNote" };

const TILTS = [
  "sticky-memo--tilt-1",
  "sticky-memo--tilt-2",
  "sticky-memo--tilt-3",
  "sticky-memo--tilt-4",
] as const;

function MemoPin() {
  return (
    <span className="sticky-memo-pin text-blue" aria-hidden>
      {/* Phosphor push-pin-fill — primary blue via currentColor */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width={22}
        height={22}
        fill="currentColor"
      >
        <path d="m235.33 104l-53.47 53.65c4.56 12.67 6.45 33.89-13.19 60A15.93 15.93 0 0 1 157 224h-1.13a16 16 0 0 1-11.32-4.69L96.29 171l-42.63 42.66a8 8 0 0 1-11.32-11.32L85 159.71l-48.3-48.3A16 16 0 0 1 38 87.63c25.42-20.51 49.75-16.48 60.4-13.14L152 20.7a16 16 0 0 1 22.63 0l60.69 60.68a16 16 0 0 1 .01 22.62" />
      </svg>
    </span>
  );
}

function formatUpdatedAt(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function previewText(raw: string | null | undefined) {
  const text = (raw || "").replace(/\s+/g, " ").trim();
  if (!text) return "Empty note";
  return text.length > 90 ? `${text.slice(0, 90).trimEnd()}…` : text;
}

export default async function FavoritesPage() {
  const session = await requireSession();
  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
      isFavorite: true,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      notebook: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  return (
    <div className="flex min-h-full flex-col">
      <AppTopBar
        title="Favorites"
        subtitle="Pinned notes you want within reach."
        hideActions
      />

      <div className="w-full flex-1 px-4 py-5 md:px-7 md:py-6">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center rounded-[28px] border border-bg-border bg-white px-6 py-20 text-center shadow-[0_8px_24px_rgba(26,26,26,0.03)]">
            <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#fff4e8] text-[#c46b12]">
              <Star size={26} strokeWidth={1.65} />
            </span>
            <p className="mt-5 font-inter-tight text-[20px] font-semibold tracking-[-0.02em] text-ink">
              No favorites yet
            </p>
            <p className="mt-2 max-w-md font-switzer text-[14px] text-muted">
              Open any note and tap Favorite to pin it here like a memo.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-baseline justify-between px-1">
              <p className="font-switzer text-[13.5px] font-medium text-muted">
                {notes.length} pinned memo{notes.length === 1 ? "" : "s"}
              </p>
            </div>

            <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 sm:gap-x-6 sm:gap-y-10">
              {notes.map((note, index) => (
                <li key={note.id} className="pt-3">
                  <Link
                    href={`/app/n/${note.id}`}
                    className={`sticky-memo ${TILTS[index % TILTS.length]} p-4 pt-5 md:p-5`}
                  >
                    <MemoPin />

                    <h3 className="line-clamp-2 font-inter-tight text-[15px] font-semibold leading-snug tracking-[-0.02em] text-ink md:text-[16px]">
                      {note.title || "Untitled"}
                    </h3>

                    <p className="mt-2 line-clamp-3 flex-1 font-switzer text-[13px] leading-relaxed text-muted md:text-[13.5px]">
                      {previewText(note.contentText)}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-bg-line pt-2.5">
                      <p className="truncate font-switzer text-[11.5px] font-medium text-ink-soft">
                        {note.notebook.name}
                      </p>
                      <time className="shrink-0 font-switzer text-[11px] text-muted">
                        {formatUpdatedAt(note.updatedAt)}
                      </time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
