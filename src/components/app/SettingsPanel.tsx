"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Shield,
  CreditCard,
  BarChart3,
  Sparkles,
  FileText,
  HardDrive,
  BookOpen,
  Star,
  Tag,
  MessageSquare,
  Paperclip,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { SettingsProfileForm } from "@/components/app/SettingsProfileForm";
import SettingsSecurityPanel, {
  type SessionRow,
} from "@/components/app/SettingsSecurityPanel";
import SettingsBillingPanel from "@/components/app/SettingsBillingPanel";
import type { UsageStats } from "@/lib/ai/quota";
import type { PlanId } from "@/generated/prisma/client";

type TabId = "profile" | "security" | "billing" | "usage";

const tabs: {
  id: TabId;
  label: string;
  icon: typeof User;
}[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "usage", label: "Usage", icon: BarChart3 },
];

const FEATURE_LABELS: Record<string, string> = {
  ask_notes: "AI Agent",
  summarize: "Summarize",
  auto_title: "Auto title",
  auto_tag: "Auto tag",
  turn_into_tasks: "Turn into tasks",
  related_notes: "Related notes",
  transcribe: "Voice transcription",
  embed: "Note indexing",
};

function featureLabel(feature: string) {
  if (FEATURE_LABELS[feature]) return FEATURE_LABELS[feature];
  if (feature.startsWith("writing:")) {
    const action = feature.slice("writing:".length).replace(/_/g, " ");
    return `Writing · ${action}`;
  }
  return feature.replace(/_/g, " ");
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${Number((bytes / 1024).toFixed(2))} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${Number((bytes / (1024 * 1024)).toFixed(2))} MB`;
  }
  return `${Number((bytes / (1024 * 1024 * 1024)).toFixed(2))} GB`;
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatResetDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function isTabId(value: string | null): value is TabId {
  return (
    value === "profile" ||
    value === "security" ||
    value === "billing" ||
    value === "usage"
  );
}

type Props = {
  user: {
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: string;
  };
  plan: {
    id: PlanId;
    name: string;
    priceMonthlyUsd: number;
    priceYearlyUsd: number;
    maxNotes: number | null;
    aiActionsPerMonth: number;
    storageBytes: number;
    custom?: boolean;
  };
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    createdAt: string;
    cancelAtPeriodEnd: boolean;
    whopMembershipId: string | null;
  };
  billing: {
    userId: string;
    userEmail: string;
    appUrl: string;
    whopConfigured: boolean;
  };
  sessions: SessionRow[];
  usage: UsageStats;
};

export default function SettingsPanel({
  user,
  plan,
  subscription,
  billing,
  sessions,
  usage,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [active, setActive] = useState<TabId>(
    isTabId(tabParam) ? tabParam : "profile",
  );
  const aiPct = Math.min(
    100,
    (usage.aiUsed / Math.max(1, usage.aiLimit)) * 100,
  );

  useEffect(() => {
    if (isTabId(tabParam) && tabParam !== active) {
      setActive(tabParam);
    }
  }, [tabParam, active]);

  function selectTab(id: TabId) {
    setActive(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id === "profile") params.delete("tab");
    else params.set("tab", id);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-5 px-4 pb-10 pt-2 md:gap-6 md:px-7">
      <div className="rounded-[24px] border border-bg-border bg-white p-2.5 shadow-[0_8px_24px_rgba(26,26,26,0.03)] sm:p-3">
        <nav
          className="flex gap-1 overflow-x-auto font-switzer"
          role="tablist"
          aria-label="Settings sections"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-[13.5px] transition ${
                  selected
                    ? "bg-blue font-semibold text-white"
                    : "font-medium text-[#6b6b6b] hover:bg-bg-soft hover:text-ink"
                }`}
              >
                <Icon
                  size={15}
                  strokeWidth={1.75}
                  className={selected ? "text-white" : "text-muted"}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <section className="h-fit overflow-hidden rounded-[28px] border border-bg-border bg-white shadow-[0_12px_40px_rgba(26,26,26,0.04)]">
        <div className="px-6 py-6 md:px-8 md:py-8" role="tabpanel">
          {active === "profile" ? (
            <SettingsProfileForm
              name={user.name}
              email={user.email}
              emailVerified={user.emailVerified}
              image={user.image}
              createdAt={user.createdAt}
              planName={plan.name}
            />
          ) : null}

          {active === "security" ? (
            <SettingsSecurityPanel
              email={user.email}
              emailVerified={user.emailVerified}
              sessions={sessions}
            />
          ) : null}

          {active === "billing" ? (
            <SettingsBillingPanel
              userId={billing.userId}
              userEmail={billing.userEmail}
              appUrl={billing.appUrl}
              whopConfigured={billing.whopConfigured}
              plan={plan}
              subscription={subscription}
              usage={{
                aiUsed: usage.aiUsed,
                noteCount: usage.noteCount,
                storageUsedBytes: usage.storageUsedBytes,
              }}
            />
          ) : null}

          {active === "usage" ? (
            <div className="space-y-6">
              <div className="rounded-[22px] border border-bg-line bg-gradient-to-br from-ink to-[#2a2a2a] p-5 text-white md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-switzer text-[12px] font-medium uppercase tracking-[0.06em] text-white/55">
                      AI quota · {plan.name}
                    </p>
                    <p className="mt-2 font-inter-tight text-[34px] font-semibold tracking-[-0.03em]">
                      {usage.aiRemaining}
                      <span className="ml-2 text-[16px] font-medium text-white/55">
                        remaining
                      </span>
                    </p>
                    <p className="mt-1.5 font-switzer text-[13px] text-white/65">
                      {usage.aiUsed} of {usage.aiLimit} actions used · resets{" "}
                      {formatResetDate(usage.periodEndIso)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectTab("billing")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 font-switzer text-[13px] font-semibold text-ink transition hover:bg-white/90"
                  >
                    Upgrade
                    <ArrowUpRight size={14} strokeWidth={2} />
                  </button>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-blue"
                    style={{ width: `${aiPct}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <UsageMeter
                  icon={Sparkles}
                  label="AI actions"
                  used={usage.aiUsed}
                  limit={usage.aiLimit}
                  hint="This billing period"
                />
                <UsageMeter
                  icon={FileText}
                  label="Notes"
                  used={usage.noteCount}
                  limit={plan.maxNotes}
                  hint={
                    plan.maxNotes === null
                      ? "Unlimited on your plan"
                      : "Active notes"
                  }
                />
                <UsageMeter
                  icon={HardDrive}
                  label="Storage"
                  used={usage.storageUsedBytes}
                  limit={plan.storageBytes}
                  formatValue={formatBytes}
                  hint={`${usage.attachmentCount} attachment${usage.attachmentCount === 1 ? "" : "s"}`}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[22px] border border-bg-line bg-bg-soft/40 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-switzer text-[14px] font-semibold text-ink">
                        Last 7 days
                      </p>
                      <p className="mt-0.5 font-switzer text-[12px] text-muted">
                        AI actions per day
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 font-switzer text-[12px] font-semibold text-ink shadow-sm">
                      {usage.last7Days.reduce((s, d) => s + d.count, 0)} total
                    </span>
                  </div>
                  <DailyBars days={usage.last7Days} />
                </div>

                <div className="rounded-[22px] border border-bg-line bg-bg-soft/40 p-5">
                  <p className="font-switzer text-[14px] font-semibold text-ink">
                    Token usage
                  </p>
                  <p className="mt-0.5 font-switzer text-[12px] text-muted">
                    This month
                  </p>
                  <div className="mt-4 space-y-3">
                    <TokenRow
                      label="Input"
                      value={formatTokens(usage.tokensIn)}
                    />
                    <TokenRow
                      label="Output"
                      value={formatTokens(usage.tokensOut)}
                    />
                    <TokenRow
                      label="Total"
                      value={formatTokens(usage.tokensIn + usage.tokensOut)}
                      strong
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-bg-line bg-bg-soft/40 p-5">
                <div className="flex items-center gap-2">
                  <Zap size={15} strokeWidth={1.85} className="text-blue" />
                  <p className="font-switzer text-[14px] font-semibold text-ink">
                    By feature
                  </p>
                </div>
                <p className="mt-0.5 font-switzer text-[12px] text-muted">
                  Where your AI quota went this month
                </p>
                {usage.featureBreakdown.length === 0 ? (
                  <p className="mt-5 font-switzer text-[13px] text-muted">
                    No AI actions yet this period.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-2.5">
                    {usage.featureBreakdown.map((row) => {
                      const pct = Math.min(
                        100,
                        (row.count / Math.max(1, usage.aiUsed)) * 100,
                      );
                      return (
                        <li key={row.feature}>
                          <div className="mb-1.5 flex items-center justify-between gap-3">
                            <span className="truncate font-switzer text-[13px] font-medium text-ink">
                              {featureLabel(row.feature)}
                            </span>
                            <span className="shrink-0 font-switzer text-[12px] font-semibold text-muted">
                              {row.count}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-bg-border/70">
                            <div
                              className="h-full rounded-full bg-blue"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div>
                <p className="mb-3 font-switzer text-[14px] font-semibold text-ink">
                  Workspace
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <StatTile
                    icon={BookOpen}
                    label="Notebooks"
                    value={usage.notebookCount}
                  />
                  <StatTile
                    icon={Star}
                    label="Favorites"
                    value={usage.favoriteCount}
                  />
                  <StatTile icon={Tag} label="Tags" value={usage.tagCount} />
                  <StatTile
                    icon={MessageSquare}
                    label="Chat threads"
                    value={usage.chatThreadCount}
                  />
                  <StatTile
                    icon={Paperclip}
                    label="Attachments"
                    value={usage.attachmentCount}
                  />
                  <StatTile
                    icon={FileText}
                    label="Active notes"
                    value={usage.noteCount}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function UsageMeter({
  icon: Icon,
  label,
  used,
  limit,
  hint,
  formatValue,
}: {
  icon: typeof Sparkles;
  label: string;
  used: number;
  limit: number | null;
  hint?: string;
  formatValue?: (n: number) => string;
}) {
  const fmt = formatValue ?? ((n: number) => String(n));
  const pct =
    limit === null ? 8 : Math.min(100, (used / Math.max(1, limit)) * 100);
  const warn = limit !== null && pct >= 85;

  return (
    <div className="rounded-[22px] border border-bg-line bg-bg-soft/50 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ink shadow-sm">
            <Icon size={22} strokeWidth={1.7} />
          </span>
          <div>
            <p className="font-switzer text-[13px] font-medium text-ink">
              {label}
            </p>
            {hint ? (
              <p className="font-switzer text-[11px] text-muted">{hint}</p>
            ) : null}
          </div>
        </div>
      </div>
      <p className="mt-4 font-inter-tight text-[22px] font-semibold tracking-[-0.02em] text-ink">
        {fmt(used)}
        {limit === null ? (
          <span className="ml-1.5 text-[13px] font-medium text-muted">
            / ∞
          </span>
        ) : (
          <span className="ml-1.5 text-[13px] font-medium text-muted">
            / {fmt(limit)}
          </span>
        )}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-border/60">
        <div
          className={`h-full rounded-full ${warn ? "bg-[#e07a3a]" : "bg-blue"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DailyBars({
  days,
}: {
  days: { date: string; count: number }[];
}) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="mt-5 flex h-28 items-end gap-2">
      {days.map((day) => {
        const height = Math.max(6, (day.count / max) * 100);
        const label = new Date(`${day.date}T12:00:00Z`).toLocaleDateString(
          undefined,
          { weekday: "short" },
        );
        return (
          <div
            key={day.date}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <span className="font-switzer text-[10px] font-semibold text-muted">
              {day.count || ""}
            </span>
            <div className="flex h-20 w-full items-end justify-center">
              <div
                className="w-full max-w-[28px] rounded-t-lg bg-blue/85"
                style={{ height: `${height}%` }}
                title={`${day.count} on ${day.date}`}
              />
            </div>
            <span className="font-switzer text-[10px] text-muted">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function TokenRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5 shadow-sm">
      <span className="font-switzer text-[13px] text-muted">{label}</span>
      <span
        className={`font-inter-tight text-[15px] ${
          strong ? "font-semibold text-ink" : "font-medium text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-bg-line bg-bg-soft/50 px-4 py-3.5">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ink shadow-sm">
        <Icon size={22} strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p className="font-switzer text-[12px] text-muted">{label}</p>
        <p className="font-inter-tight text-[18px] font-semibold text-ink">
          {value}
        </p>
      </div>
    </div>
  );
}
