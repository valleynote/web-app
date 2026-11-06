"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CreditCard,
  Loader2,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { PRICING_CARDS, type PricingCard } from "@/lib/plans";
import {
  cancelSubscriptionAction,
  resumeSubscriptionAction,
} from "@/server/actions/billing";
import type { PlanId } from "@/generated/prisma/client";
import {
  isPaidPlanId,
  type BillingInterval,
} from "@/lib/whop-plans";

type Props = {
  /** @deprecated kept for call-site compatibility — checkout is a full page now */
  userId?: string;
  userEmail?: string;
  appUrl?: string;
  whopConfigured: boolean;
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
  usage: {
    aiUsed: number;
    noteCount: number;
    storageUsedBytes: number;
  };
};

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

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function planRank(id: string) {
  const order = ["free", "plus", "pro", "enterprise", "team", "basic"];
  return order.indexOf(id);
}

export default function SettingsBillingPanel({
  whopConfigured,
  plan,
  subscription,
  usage,
}: Props) {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingInterval>("monthly");
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cards = useMemo(() => PRICING_CARDS, []);

  function openCheckout(card: PricingCard) {
    if (card.custom) {
      window.location.href = "/contact";
      return;
    }
    if (!isPaidPlanId(card.id)) return;
    if (card.id === plan.id) {
      toast.message("You’re already on this plan");
      return;
    }
    if (!whopConfigured) {
      toast.error("Payments are not configured yet");
      return;
    }

    router.push(`/checkout?plan=${card.id}&interval=${billing}`);
  }

  function downgradeToFree(immediate = false) {
    if (plan.id === "free") return;
    setPendingPlan("free");
    startTransition(async () => {
      const result = await cancelSubscriptionAction({ immediate });
      setPendingPlan(null);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        immediate
          ? "Moved to Free plan"
          : "Cancellation scheduled — you keep access until the period ends",
      );
    });
  }

  function resumeBilling() {
    setPendingPlan("resume");
    startTransition(async () => {
      const result = await resumeSubscriptionAction();
      setPendingPlan(null);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Resumed ${"planName" in result ? result.planName : plan.name}`);
    });
  }

  return (
    <div className="space-y-6 font-switzer">
      <div className="rounded-[22px] border border-bg-line bg-gradient-to-br from-ink to-[#2a2a2a] p-5 text-white md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-white/55">
              Current plan
            </p>
            <p className="mt-2 font-inter-tight text-[34px] font-semibold tracking-[-0.03em]">
              {plan.name}
            </p>
            <p className="mt-1.5 text-[13px] text-white/65">
              {plan.custom
                ? "Custom pricing — contact us for a quote"
                : plan.priceMonthlyUsd > 0
                  ? `$${plan.priceMonthlyUsd}/mo · $${plan.priceYearlyUsd}/yr`
                  : "Free starter limits — upgrade anytime"}
            </p>
            <p className="mt-2 text-[12px] text-white/50">
              Status{" "}
              <span className="capitalize text-white/80">
                {subscription.status}
              </span>
              {subscription.cancelAtPeriodEnd
                ? ` · cancels ${formatDate(subscription.currentPeriodEnd)}`
                : subscription.currentPeriodEnd
                  ? ` · renews ${formatDate(subscription.currentPeriodEnd)}`
                  : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <LimitStat
            label="AI this month"
            value={`${usage.aiUsed} / ${plan.aiActionsPerMonth}`}
          />
          <LimitStat
            label="Notes"
            value={
              plan.maxNotes === null
                ? `${usage.noteCount} / ∞`
                : `${usage.noteCount} / ${plan.maxNotes}`
            }
          />
          <LimitStat
            label="Storage"
            value={`${formatBytes(usage.storageUsedBytes)} / ${formatBytes(plan.storageBytes)}`}
          />
        </div>
      </div>

      <div className="rounded-[22px] border border-bg-line bg-bg-soft/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[14px] font-semibold text-ink">Choose a plan</p>
            <p className="mt-0.5 text-[13px] text-muted">
              Upgrade on a full-page checkout — stay on ValleyNote while you pay
            </p>
          </div>
          <div
            className="relative inline-grid grid-cols-2 rounded-full border border-bg-border bg-white p-1"
            role="group"
            aria-label="Billing period"
          >
            <motion.span
              aria-hidden
              className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-ink"
              animate={{ x: billing === "monthly" ? 0 : "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            />
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`relative z-10 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors duration-200 ${
                billing === "monthly"
                  ? "text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`relative z-10 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors duration-200 ${
                billing === "yearly"
                  ? "text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const isCurrent =
              card.id === plan.id ||
              (plan.id === "team" && card.id === "enterprise");
            const price = card.custom
              ? null
              : billing === "yearly"
                ? Math.round(card.yearlyTotal / 12)
                : card.monthly;
            const upgrading = planRank(card.id) > planRank(plan.id);
            const busy = pending && pendingPlan === card.id;

            return (
              <article
                key={card.id}
                className={`relative flex flex-col rounded-[20px] border bg-white p-5 ${
                  card.popular
                    ? "border-blue ring-2 ring-blue/10"
                    : "border-bg-line"
                }`}
              >
                {card.popular ? (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-blue px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    Popular
                  </span>
                ) : null}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-inter-tight text-[20px] font-semibold text-ink">
                      {card.name}
                    </p>
                    <p className="mt-1 text-[13px] leading-snug text-muted">
                      {card.tagline}
                    </p>
                  </div>
                  {isCurrent ? (
                    <span className="shrink-0 rounded-full bg-bg-muted px-2.5 py-1 text-[11px] font-semibold text-ink">
                      Current
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 min-h-[52px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${card.id}-${billing}`}
                      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      <p className="font-inter-tight text-[28px] font-semibold tracking-[-0.03em] text-ink">
                        {card.custom ? (
                          "Custom"
                        ) : (
                          <>
                            ${price}
                            <span className="ml-1 text-[13px] font-medium text-muted">
                              /mo
                            </span>
                          </>
                        )}
                      </p>
                      {!card.custom && billing === "yearly" ? (
                        <p className="text-[12px] text-muted">
                          Billed ${card.yearlyTotal}/yr
                        </p>
                      ) : (
                        <p className="h-[18px] text-[12px] text-transparent">
                          &nbsp;
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <ul className="mt-4 space-y-2">
                  {card.features.slice(0, 5).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-[13px] text-ink"
                    >
                      <Check
                        size={14}
                        strokeWidth={2}
                        className="mt-0.5 shrink-0 text-blue"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={pending || isCurrent}
                  onClick={() => openCheckout(card)}
                  className={`mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold transition disabled:opacity-60 ${
                    isCurrent
                      ? "border border-bg-border bg-bg-soft text-muted"
                      : card.popular
                        ? "bg-blue text-white hover:bg-blue/90"
                        : "bg-ink text-white hover:bg-ink-soft"
                  }`}
                >
                  {busy ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Updating…
                    </>
                  ) : isCurrent ? (
                    "Current plan"
                  ) : card.custom ? (
                    "Contact sales"
                  ) : upgrading ? (
                    <>
                      <Sparkles size={14} strokeWidth={1.85} />
                      Upgrade to {card.name}
                    </>
                  ) : (
                    `Switch to ${card.name}`
                  )}
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <div className="rounded-[22px] border border-bg-line bg-bg-soft/40 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink shadow-sm">
            <CreditCard size={17} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-ink">Billing details</p>
            <p className="mt-0.5 text-[13px] text-muted">
              Member since {formatDate(subscription.createdAt)}. Payments run
              through Whop on ValleyNote&apos;s hosted checkout page.
              {subscription.whopMembershipId
                ? " Your subscription is linked to Whop."
                : ""}
            </p>
            {subscription.cancelAtPeriodEnd ? (
              <button
                type="button"
                disabled={pending}
                onClick={resumeBilling}
                className="mt-4 rounded-full border border-bg-border bg-white px-4 py-2.5 text-[13px] font-medium text-ink transition hover:bg-bg-soft disabled:opacity-60"
              >
                {pending && pendingPlan === "resume"
                  ? "Resuming…"
                  : "Keep my plan"}
              </button>
            ) : plan.id !== "free" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => downgradeToFree(false)}
                  className="rounded-full border border-bg-border bg-white px-4 py-2.5 text-[13px] font-medium text-ink transition hover:bg-bg-soft disabled:opacity-60"
                >
                  {pending && pendingPlan === "free"
                    ? "Scheduling…"
                    : "Cancel at period end"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => downgradeToFree(true)}
                  className="rounded-full border border-bg-border bg-white px-4 py-2.5 text-[13px] font-medium text-muted transition hover:bg-bg-soft hover:text-ink disabled:opacity-60"
                >
                  Downgrade to Free now
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

    </div>
  );
}

function LimitStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-[0.06em] text-white/55">
        {label}
      </p>
      <p className="mt-1 font-inter-tight text-[18px] font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
