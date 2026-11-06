"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import WhopCheckoutEmbed from "@/components/billing/WhopCheckoutEmbed";
import { assets } from "@/lib/assets";
import { getPlan, PRICING_CARDS } from "@/lib/plans";
import {
  getWhopPlanId,
  type BillingInterval,
  type PaidPlanId,
} from "@/lib/whop-plans";

type Props = {
  planId: PaidPlanId;
  interval: BillingInterval;
  accountId: string;
  userId: string;
  userEmail: string;
  userName: string;
  appUrl: string;
  fromOnboarding: boolean;
  whopConfigured: boolean;
  sandbox?: boolean;
};

export default function CheckoutPageClient({
  planId: initialPlanId,
  interval: initialInterval,
  accountId,
  userId,
  userEmail,
  userName,
  appUrl,
  fromOnboarding,
  whopConfigured,
  sandbox = false,
}: Props) {
  const router = useRouter();
  const [planId, setPlanId] = useState<PaidPlanId>(initialPlanId);
  const [interval, setInterval] = useState<BillingInterval>(initialInterval);

  const card = useMemo(
    () => PRICING_CARDS.find((c) => c.id === planId) ?? PRICING_CARDS[0],
    [planId],
  );
  const plan = getPlan(planId);
  const whopPlanId = getWhopPlanId(planId, interval);
  const priceMonthly =
    interval === "yearly"
      ? Math.round(card.yearlyTotal / 12)
      : card.monthly;
  const dueToday =
    interval === "yearly" ? card.yearlyTotal : card.monthly;

  const returnUrl = `${appUrl}/checkout/complete?plan=${planId}&interval=${interval}`;
  const backHref = fromOnboarding
    ? "/choose-plan"
    : "/app/settings?tab=billing";

  function updateQuery(nextPlan: PaidPlanId, nextInterval: BillingInterval) {
    setPlanId(nextPlan);
    setInterval(nextInterval);
    const params = new URLSearchParams({
      plan: nextPlan,
      interval: nextInterval,
    });
    if (fromOnboarding) params.set("from", "onboarding");
    router.replace(`/checkout?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#f7f5f2_0%,#efece7_48%,#f7f5f2_100%)]">
      <div className="mx-auto grid min-h-[100dvh] w-full max-w-6xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <aside className="flex flex-col border-b border-bg-line px-5 py-8 md:px-10 md:py-12 lg:border-b-0 lg:border-r lg:border-bg-line/80">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={fromOnboarding ? "/choose-plan" : "/app"}
              className="inline-flex shrink-0"
            >
              <Image
                src={assets.logo}
                alt="ValleyNote"
                width={152}
                height={36}
                className="h-[30px] w-auto sm:h-8"
                priority
              />
            </Link>
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-muted transition hover:text-ink"
            >
              <ArrowLeft size={14} />
              {fromOnboarding ? "Plans" : "Billing"}
            </Link>
          </div>

          <h1 className="mt-10 font-inter-tight text-[32px] font-semibold tracking-[-0.03em] text-ink md:text-[38px]">
            Activate {plan.name}
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            {card.tagline}
          </p>

          <div className="mt-8 space-y-3">
            {(["monthly", "yearly"] as const).map((value) => {
              const selected = interval === value;
              const amount =
                value === "yearly"
                  ? Math.round(card.yearlyTotal / 12)
                  : card.monthly;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateQuery(planId, value)}
                  className={`w-full rounded-[18px] border px-4 py-4 text-left transition ${
                    selected
                      ? "border-ink bg-white shadow-[0_10px_30px_rgba(26,26,26,0.06)]"
                      : "border-bg-line bg-white/50 hover:border-bg-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-ink">
                        {value === "monthly" ? "Monthly" : "Annual"}
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-muted">
                        {value === "yearly"
                          ? `Save on ${plan.name} · billed $${card.yearlyTotal}/yr`
                          : `Flexible · cancel anytime`}
                      </p>
                    </div>
                    <p className="font-inter-tight text-[18px] font-semibold text-ink">
                      ${amount}
                      <span className="text-[12px] font-medium text-muted">
                        /mo
                      </span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <p className="text-[13px] font-semibold text-ink">
              What you&apos;ll unlock
            </p>
            <ul className="mt-3 space-y-2.5">
              {card.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-[13.5px] text-ink"
                >
                  <Check
                    size={15}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-ink"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto hidden pt-10 lg:block">
            <p className="text-[12.5px] leading-relaxed text-muted">
              Due today{" "}
              <span className="font-semibold text-ink">${dueToday}</span>
              {interval === "yearly" ? " for the year" : " for the first month"}
              .
            </p>
          </div>
        </aside>

        <section className="flex flex-col px-5 py-8 md:px-10 md:py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
                Payment
              </p>
              <h2 className="mt-1 font-inter-tight text-[24px] font-semibold text-ink">
                Complete checkout
              </h2>
            </div>
            <div className="inline-flex gap-2 rounded-full border border-bg-border bg-white p-1">
              {(["plus", "pro"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateQuery(id, interval)}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                    planId === id
                      ? "bg-ink text-white"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {getPlan(id).name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-bg-line bg-white p-4 shadow-[0_20px_60px_rgba(26,26,26,0.06)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-bg-line pb-4">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">
                  ValleyNote {plan.name}
                </p>
                <p className="text-[13px] text-muted">
                  Billed {interval === "yearly" ? "yearly" : "monthly"}
                </p>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`${planId}-${interval}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="font-inter-tight text-[22px] font-semibold text-ink"
                >
                  ${priceMonthly}
                  <span className="text-[12px] font-medium text-muted">/mo</span>
                </motion.p>
              </AnimatePresence>
            </div>

            {!whopConfigured || !accountId ? (
              <div className="rounded-[16px] border border-bg-line bg-bg-soft/60 px-4 py-8 text-center">
                <p className="text-[14px] font-medium text-ink">
                  Payments are not configured yet
                </p>
                <p className="mt-1 text-[13px] text-muted">
                  Add Whop keys to enable checkout, or{" "}
                  <Link href="/choose-plan" className="underline">
                    pick Free
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <WhopCheckoutEmbed
                key={`${whopPlanId}-${interval}`}
                planId={planId}
                planName={plan.name}
                interval={interval}
                whopPlanId={whopPlanId}
                accountId={accountId}
                userId={userId}
                userEmail={userEmail}
                userName={userName}
                returnUrl={returnUrl}
                dueToday={dueToday}
                sandbox={sandbox}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
