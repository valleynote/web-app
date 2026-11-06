import Link from "next/link";
import {
  FilePlus2,
  ListTodo,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/plans";
import { getMonthlyAiUsage } from "@/lib/ai/quota";
import AgentAskBar from "@/components/app/AgentAskBar";
import { QuickNewNoteButton } from "@/components/app/QuickNewNoteButton";
import NotebookIcon from "@/components/app/NotebookIcon";

export const metadata = {
  title: "Home — ValleyNote",
};

const SUGGESTIONS = [
  {
    label: "Research my notes",
    q: "What are my main open ideas across my notebooks?",
    icon: Search,
  },
  {
    label: "Create a note",
    q: "Create a new note titled Meeting ideas with a short outline.",
    icon: FilePlus2,
  },
  {
    label: "Find to-dos",
    q: "List anything that looks like a to-do in my notes.",
    icon: ListTodo,
  },
  {
    label: "Summarize recent",
    q: "Summarize what I’ve been working on in my recent notes.",
    icon: Sparkles,
  },
] as const;

function formatRelative(date: Date) {
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

export default async function AppHomePage() {
  const session = await requireSession();
  const userId = session.user.id;
  const firstName = session.user.name.trim().split(" ")[0] || "there";

  const [notes, noteCount, favoriteCount, subscription, aiUsed] =
    await Promise.all([
      prisma.note.findMany({
        where: { userId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          notebook: {
            select: { id: true, name: true, icon: true, color: true },
          },
        },
      }),
      prisma.note.count({ where: { userId, deletedAt: null } }),
      prisma.note.count({
        where: { userId, deletedAt: null, isFavorite: true },
      }),
      prisma.subscription.findUnique({ where: { userId } }),
      getMonthlyAiUsage(userId),
    ]);

  const plan = getPlan(subscription?.plan ?? "free");
  const aiRemaining = Math.max(0, plan.aiActionsPerMonth - aiUsed);
  const noteLimit = plan.maxNotes;

  return (
    <div className="flex min-h-full flex-col">
      <div className="home-stagger mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-8 pt-6 md:px-7 md:pb-10 md:pt-8">
        {/* Agent — primary focus, chat-like calm */}
        <section className="home-enter flex flex-col items-center pt-4 md:pt-8">
          <div className="flex w-full flex-col items-center text-center">
            <div className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue" />
              </span>
              <p className="font-switzer text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
                ValleyNote Agent
              </p>
            </div>
            <h2 className="mt-3 max-w-2xl font-inter-tight text-[26px] font-semibold tracking-[-0.035em] text-ink md:text-[32px]">
              Hey {firstName}. What should we work on?
            </h2>
          </div>

          <div className="mt-6 w-full">
            <AgentAskBar large />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
            {SUGGESTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.label}
                  href={`/app/chat?q=${encodeURIComponent(s.q)}`}
                  className="inline-flex items-center gap-1.5 font-switzer text-[13px] text-muted transition hover:text-ink"
                >
                  <Icon
                    size={14}
                    strokeWidth={1.85}
                    className="text-blue/80"
                  />
                  {s.label}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Quiet status — useful, not a dashboard */}
        <section className="home-enter mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-switzer text-[12.5px] text-muted md:mt-10">
          <Link
            href="/app/notes"
            className="transition hover:text-ink"
          >
            {noteCount} note{noteCount === 1 ? "" : "s"}
            {noteLimit !== null ? ` / ${noteLimit}` : ""}
          </Link>
          <span aria-hidden className="text-bg-border">
            ·
          </span>
          <Link
            href="/app/settings?tab=usage"
            className="transition hover:text-ink"
          >
            {aiRemaining} AI left
          </Link>
          {favoriteCount > 0 ? (
            <>
              <span aria-hidden className="text-bg-border">
                ·
              </span>
              <Link
                href="/app/favorites"
                className="inline-flex items-center gap-1 transition hover:text-ink"
              >
                <Star size={11} strokeWidth={2} className="text-[#b45309]" />
                {favoriteCount}
              </Link>
            </>
          ) : null}
          <span aria-hidden className="text-bg-border">
            ·
          </span>
          <Link
            href="/app/plans"
            className="transition hover:text-ink"
          >
            {plan.name} plan
          </Link>
        </section>

        {/* Recent — continue the work */}
        <section className="home-enter mt-10 md:mt-12">
          <div className="mb-3 flex items-baseline justify-between gap-3 px-0.5">
            <h3 className="font-inter-tight text-[15px] font-semibold tracking-[-0.02em] text-ink">
              Continue
            </h3>
            {notes.length > 0 ? (
              <Link
                href="/app/notes"
                className="font-switzer text-[13px] font-medium text-blue transition hover:underline"
              >
                All notes
              </Link>
            ) : null}
          </div>

          {notes.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-bg-border bg-white/60 px-5 py-12 text-center">
              <p className="font-switzer text-[14px] text-muted">
                No notes yet. Ask the agent to create one, or start blank.
              </p>
              <div className="mt-4 flex justify-center">
                <QuickNewNoteButton />
              </div>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-[22px] border border-bg-border/70 bg-white/80">
              {notes.map((note) => (
                <li key={note.id} className="border-b border-bg-line last:border-b-0">
                  <Link
                    href={`/app/n/${note.id}`}
                    className="flex items-center gap-3.5 px-4 py-3 transition hover:bg-bg-soft/80 md:px-5 md:py-3.5"
                  >
                    <NotebookIcon
                      id={note.notebook.id}
                      color={note.notebook.color}
                      size={36}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-inter-tight text-[14.5px] font-semibold tracking-[-0.015em] text-ink">
                          {note.title || "Untitled"}
                        </p>
                        {note.isFavorite ? (
                          <Star
                            size={12}
                            strokeWidth={2}
                            fill="currentColor"
                            className="shrink-0 text-[#b45309]"
                          />
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate font-switzer text-[12.5px] text-muted">
                        {note.notebook.name}
                        {note.contentText?.trim()
                          ? ` · ${note.contentText.trim()}`
                          : ""}
                      </p>
                    </div>
                    <time className="shrink-0 font-switzer text-[11.5px] text-muted">
                      {formatRelative(note.updatedAt)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
