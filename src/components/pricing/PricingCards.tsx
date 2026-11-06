"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import PricingComparison from "@/components/pricing/PricingComparison";
import { LANDING_PRICING_CARDS, type PricingCard } from "@/lib/plans";

type Billing = "monthly" | "yearly";

function planPrice(plan: PricingCard, billing: Billing) {
  if (plan.custom) return null;
  if (plan.monthly === 0) return 0;
  if (billing === "yearly" && plan.yearlyTotal > 0) {
    return Math.round(plan.yearlyTotal / 12);
  }
  return plan.monthly;
}

export default function PricingCards({
  variant = "marketing",
  showComparison = true,
}: {
  variant?: "marketing" | "app";
  showComparison?: boolean;
}) {
  const [billing, setBilling] = useState<Billing>("monthly");
  const cards = LANDING_PRICING_CARDS;

  return (
    <div className="font-switzer">
      <div className="mb-8 flex justify-center">
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
            className={`relative z-10 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors duration-200 ${
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
            className={`relative z-10 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors duration-200 ${
              billing === "yearly"
                ? "text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((plan) => {
          const price = planPrice(plan, billing);
          const href = variant === "app" ? plan.hrefApp : plan.hrefMarketing;
          const showYearlyNote =
            !plan.custom && plan.yearlyTotal > 0 && billing === "yearly";

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-[18px] border bg-white p-4 transition duration-300 sm:rounded-[20px] sm:p-5 ${
                plan.popular
                  ? "border-blue shadow-[0_18px_50px_rgba(55,69,241,0.12)] ring-2 ring-blue/10"
                  : "border-bg-line hover:border-bg-border"
              }`}
            >
              {plan.popular ? (
                <span className="absolute -top-2.5 right-4 rounded-full bg-blue px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  Popular
                </span>
              ) : null}

              <div>
                <p className="font-inter-tight text-[20px] font-semibold text-ink">
                  {plan.name}
                </p>
                <p className="mt-1 min-h-[40px] text-[13px] leading-snug text-muted">
                  {plan.tagline}
                </p>
              </div>

              <div className="mt-4 min-h-[52px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${plan.id}-${billing}`}
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <p className="font-inter-tight text-[28px] font-semibold tracking-[-0.03em] text-ink">
                      {plan.custom ? (
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
                    {showYearlyNote ? (
                      <p className="text-[12px] text-muted">
                        Billed ${plan.yearlyTotal}/yr
                      </p>
                    ) : (
                      <p className="h-[18px] text-[12px] text-transparent">
                        &nbsp;
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.slice(0, 5).map((feature) => (
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

              <Link
                href={href}
                className={`mt-5 inline-flex h-11 items-center justify-center rounded-full text-[13.5px] font-semibold transition ${
                  plan.custom
                    ? "bg-ink text-white hover:bg-ink-soft"
                    : plan.popular
                      ? "bg-blue text-white hover:bg-blue/90"
                      : plan.id === "free"
                        ? "border border-bg-border bg-bg-soft text-ink hover:bg-white"
                        : "bg-ink text-white hover:bg-ink-soft"
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          );
        })}
      </div>

      {showComparison ? (
        <PricingComparison billing={billing} variant={variant} />
      ) : null}
    </div>
  );
}
