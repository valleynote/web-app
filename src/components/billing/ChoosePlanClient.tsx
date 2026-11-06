"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { assets } from "@/lib/assets";
import { FREE_PRICING_CARD, PRICING_CARDS } from "@/lib/plans";
import { chooseFreePlanAction } from "@/server/actions/billing";
import type { BillingInterval } from "@/lib/whop-plans";

type Props = {
  userName: string;
  whopConfigured: boolean;
};

export default function ChoosePlanClient({
  userName,
  whopConfigured,
}: Props) {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingInterval>("monthly");
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cards = useMemo(
    () => [FREE_PRICING_CARD, ...PRICING_CARDS.filter((c) => !c.custom)],
    [],
  );

  function selectPaid(planId: "plus" | "pro") {
    if (!whopConfigured) {
      toast.error("Payments are not configured yet");
      return;
    }
    setBusy(planId);
    router.push(`/checkout?plan=${planId}&interval=${billing}&from=onboarding`);
  }

  function selectFree() {
    setBusy("free");
    startTransition(async () => {
      const result = await chooseFreePlanAction();
      setBusy(null);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("You're on Free — welcome to ValleyNote");
      router.push("/app");
      router.refresh();
    });
  }

  const firstName = userName.trim().split(/\s+/)[0] || "there";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8 md:py-14">
      <div className="max-w-2xl">
        <Image
          src={assets.logo}
          alt="ValleyNote"
          width={148}
          height={34}
          className="h-8 w-auto"
          priority
        />
        <h1 className="mt-6 font-inter-tight text-[34px] font-semibold tracking-[-0.03em] text-ink md:text-[42px]">
          Choose your plan, {firstName}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Start free, or unlock voice notes and Ask my notes with Plus or Pro.
          Paid plans take you to secure checkout before the app opens.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
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
          {(["monthly", "yearly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setBilling(value)}
              className={`relative z-10 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors ${
                billing === value ? "text-white" : "text-muted hover:text-ink"
              }`}
            >
              {value === "monthly" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-muted">
          Need Enterprise?{" "}
          <Link href="/contact" className="font-medium text-ink underline-offset-2 hover:underline">
            Contact sales
          </Link>
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const price =
            card.id === "free"
              ? 0
              : billing === "yearly"
                ? Math.round(card.yearlyTotal / 12)
                : card.monthly;
          const isBusy = pending && busy === card.id;

          return (
            <article
              key={card.id}
              className={`relative flex flex-col rounded-[22px] border bg-white p-5 md:p-6 ${
                card.popular
                  ? "border-ink shadow-[0_18px_50px_rgba(26,26,26,0.08)]"
                  : "border-bg-line"
              }`}
            >
              {card.popular ? (
                <span className="absolute -top-2.5 right-4 rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  Popular
                </span>
              ) : null}

              <p className="font-inter-tight text-[22px] font-semibold text-ink">
                {card.name}
              </p>
              <p className="mt-1 min-h-[40px] text-[13px] leading-snug text-muted">
                {card.tagline}
              </p>

              <div className="mt-5 min-h-[56px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${card.id}-${billing}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <p className="font-inter-tight text-[32px] font-semibold tracking-[-0.03em] text-ink">
                      ${price}
                      <span className="ml-1 text-[13px] font-medium text-muted">
                        /mo
                      </span>
                    </p>
                    {card.id !== "free" && billing === "yearly" ? (
                      <p className="text-[12px] text-muted">
                        Billed ${card.yearlyTotal}/yr
                      </p>
                    ) : (
                      <p className="h-[18px] text-[12px] text-transparent">&nbsp;</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <ul className="mt-4 space-y-2.5">
                {card.features.slice(0, 5).map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[13px] text-ink"
                  >
                    <Check
                      size={14}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-ink"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => {
                  if (card.id === "free") selectFree();
                  else if (card.id === "plus" || card.id === "pro") {
                    selectPaid(card.id);
                  }
                }}
                className={`mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold transition disabled:opacity-60 ${
                  card.popular
                    ? "bg-ink text-white hover:bg-ink-soft"
                    : "border border-bg-border bg-white text-ink hover:bg-bg-soft"
                }`}
              >
                {isBusy || busy === card.id ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Continuing…
                  </>
                ) : card.id === "free" ? (
                  "Continue with Free"
                ) : (
                  `Continue to ${card.name}`
                )}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
