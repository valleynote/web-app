"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  Home,
  Sparkles,
  Star,
  Trash2,
  User,
  LogOut,
  BookOpen,
  ChevronDown,
  MessageSquareHeart,
} from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";
import { openFeedbackModal } from "@/components/app/FeedbackModal";

type SidebarFolder = {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
  noteCount: number;
};

const primary = [
  { href: "/app", label: "Home", icon: Home, exact: true },
  { href: "/app/chat", label: "AI Agent", icon: Sparkles },
  { href: "/app/favorites", label: "Favorites", icon: Star },
];

const general = [
  { href: "/app/trash", label: "Trash", icon: Trash2 },
  { href: "/app/settings", label: "Profile", icon: User },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-2xl px-3 py-[10px] font-switzer text-[13.5px] transition ${
        active
          ? "bg-bg-muted font-semibold text-ink"
          : "font-medium text-[#6b6b6b] hover:bg-bg-soft hover:text-ink"
      }`}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-blue"
        />
      ) : null}
      <Icon
        size={18}
        strokeWidth={1.7}
        className={
          active ? "text-ink" : "text-[#9a9a9a] group-hover:text-ink"
        }
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function MyNotesNav({ folders }: { folders: SidebarFolder[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFolderId = searchParams.get("folder");

  const inNotesArea =
    pathname === "/app/notes" ||
    pathname.startsWith("/app/notes/") ||
    pathname.startsWith("/app/nb/") ||
    pathname.startsWith("/app/n/");

  const [open, setOpen] = useState(inNotesArea);

  useEffect(() => {
    if (inNotesArea) setOpen(true);
  }, [inNotesArea]);

  const roots = useMemo(
    () => folders.filter((f) => !f.parentId),
    [folders],
  );

  const allActive = pathname.startsWith("/app/notes") && !activeFolderId;
  const parentActive = inNotesArea;

  return (
    <div>
      <div
        className={`group relative flex items-center rounded-2xl transition ${
          parentActive && !activeFolderId && pathname.startsWith("/app/notes")
            ? "bg-bg-muted"
            : ""
        }`}
      >
        {parentActive ? (
          <span
            aria-hidden
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-blue"
          />
        ) : null}
        <Link
          href="/app/notes"
          className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-[10px] font-switzer text-[13.5px] transition ${
            parentActive
              ? "font-semibold text-ink"
              : "font-medium text-[#6b6b6b] hover:text-ink"
          }`}
        >
          <BookOpen
            size={18}
            strokeWidth={1.7}
            className={
              parentActive ? "text-ink" : "text-[#9a9a9a] group-hover:text-ink"
            }
          />
          <span className="truncate">My Notes</span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Collapse folders" : "Expand folders"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="mr-1.5 rounded-xl p-1.5 text-[#9a9a9a] transition hover:bg-bg-soft hover:text-ink"
        >
          <ChevronDown
            size={15}
            strokeWidth={2}
            className={`transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
          />
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="relative ml-[22px] space-y-0.5 border-l border-bg-line py-1 pl-3">
            <Link
              href="/app/notes"
              className={`flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 font-switzer text-[12.5px] transition ${
                allActive
                  ? "font-semibold text-ink"
                  : "font-medium text-[#7a7570] hover:text-ink"
              }`}
            >
              <span className="min-w-0 flex-1 truncate">All notes</span>
            </Link>

            {roots.map((folder) => {
              const active =
                activeFolderId === folder.id ||
                pathname === `/app/nb/${folder.id}`;
              return (
                <Link
                  key={folder.id}
                  href={`/app/notes?folder=${folder.id}`}
                  className={`flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 font-switzer text-[12.5px] transition ${
                    active
                      ? "font-semibold text-ink"
                      : "font-medium text-[#7a7570] hover:text-ink"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                  <span className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[10px] tabular-nums text-muted">
                    {folder.noteCount}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppSidebar({
  planName,
  aiUsed,
  aiLimit,
  folders = [],
}: {
  userName: string;
  userEmail: string;
  planName: string;
  aiUsed: number;
  aiLimit: number;
  folders?: SidebarFolder[];
}) {
  const pathname = usePathname();
  const usagePct = Math.min(100, (aiUsed / Math.max(1, aiLimit)) * 100);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col overflow-hidden rounded-[22px] border border-white/80 bg-[#f7f5f3] shadow-[0_1px_2px_rgba(26,26,26,0.03)] md:w-[260px] md:rounded-[28px]">
      <div className="flex items-center px-5 pb-2 pt-5">
        <Link href="/app" className="flex min-w-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-dashboard.svg"
            alt="ValleyNote"
            width={152}
            height={36}
            className="h-8 w-auto max-w-full object-contain object-left md:h-9"
          />
        </Link>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-auto px-3">
        <p className="mb-2 px-3 font-switzer text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9590]">
          Menu
        </p>
        <nav className="space-y-0.5">
          {primary.slice(0, 1).map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={isActive(link.href, link.exact)}
            />
          ))}

          <Suspense
            fallback={
              <NavLink
                href="/app/notes"
                label="My Notes"
                icon={BookOpen}
                active={
                  pathname === "/app/notes" ||
                  pathname.startsWith("/app/notes/") ||
                  pathname.startsWith("/app/nb/") ||
                  pathname.startsWith("/app/n/")
                }
              />
            }
          >
            <MyNotesNav folders={folders} />
          </Suspense>

          {primary.slice(1).map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={isActive(link.href, link.exact)}
            />
          ))}
        </nav>

        <p className="mb-2 mt-6 px-3 font-switzer text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9590]">
          General
        </p>
        <nav className="space-y-0.5">
          {general.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={isActive(link.href)}
            />
          ))}
          <button
            type="button"
            onClick={() => openFeedbackModal()}
            className="group relative flex w-full items-center gap-3 rounded-2xl px-3 py-[10px] font-switzer text-[13.5px] font-medium text-[#6b6b6b] transition hover:bg-bg-soft hover:text-ink"
          >
            <MessageSquareHeart
              size={18}
              strokeWidth={1.7}
              className="text-[#9a9a9a] group-hover:text-ink"
            />
            Feedback
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success("Signed out");
              posthog.reset();
              void authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = "/login";
                  },
                  onError: () => {
                    toast.error("Could not sign out");
                  },
                },
              });
            }}
            className="group relative flex w-full items-center gap-3 rounded-2xl px-3 py-[10px] font-switzer text-[13.5px] font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut
              size={18}
              strokeWidth={1.7}
              className="text-red-600 group-hover:text-red-700"
            />
            Logout
          </button>
        </nav>
      </div>

      <div className="px-3 pb-3.5 pt-2">
        <div className="rounded-[22px] bg-ink px-4 py-4 text-white shadow-[0_16px_36px_rgba(26,26,26,0.18)]">
          <p className="font-switzer text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55">
            Plan
          </p>
          <p className="mt-1 font-inter-tight text-[18px] font-semibold tracking-[-0.02em]">
            {planName}
          </p>
          <p className="mt-1.5 font-switzer text-[12px] leading-snug text-white/65">
            {aiUsed} / {aiLimit} AI actions used
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-blue"
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <Link
            href="/app/settings?tab=billing"
            className="mt-3.5 flex w-full items-center justify-center rounded-full bg-white py-2.5 font-switzer text-[13px] font-semibold text-ink transition hover:bg-white/90"
          >
            Manage plan
          </Link>
        </div>
      </div>
    </aside>
  );
}
