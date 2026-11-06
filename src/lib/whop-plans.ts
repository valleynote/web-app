import type { PlanId } from "@/generated/prisma/client";

export type PaidPlanId = "plus" | "pro";
export type BillingInterval = "monthly" | "yearly";

/** Whop variant (`plan_…`) IDs for each ValleyNote paid tier. */
export const WHOP_PLAN_IDS: Record<
  PaidPlanId,
  Record<BillingInterval, string>
> = {
  plus: {
    monthly:
      process.env.NEXT_PUBLIC_WHOP_PLAN_PLUS_MONTHLY ||
      process.env.WHOP_PLAN_PLUS_MONTHLY ||
      "plan_5IGyflmLN4Hcw",
    yearly:
      process.env.NEXT_PUBLIC_WHOP_PLAN_PLUS_YEARLY ||
      process.env.WHOP_PLAN_PLUS_YEARLY ||
      "plan_eRUYXZ65ydc1f",
  },
  pro: {
    monthly:
      process.env.NEXT_PUBLIC_WHOP_PLAN_PRO_MONTHLY ||
      process.env.WHOP_PLAN_PRO_MONTHLY ||
      "plan_tYrnUnyWxTvsD",
    yearly:
      process.env.NEXT_PUBLIC_WHOP_PLAN_PRO_YEARLY ||
      process.env.WHOP_PLAN_PRO_YEARLY ||
      "plan_h4vZGLySgXjEB",
  },
};

/** Legacy Basic Whop IDs — still resolve for existing subscribers. */
const LEGACY_BASIC_WHOP_PLAN_IDS: Record<BillingInterval, string> = {
  monthly:
    process.env.NEXT_PUBLIC_WHOP_PLAN_BASIC_MONTHLY ||
    process.env.WHOP_PLAN_BASIC_MONTHLY ||
    "plan_gD0vo48Uzd0N1",
  yearly:
    process.env.NEXT_PUBLIC_WHOP_PLAN_BASIC_YEARLY ||
    process.env.WHOP_PLAN_BASIC_YEARLY ||
    "plan_G7oQfq5jdiZac",
};

const PLAN_ID_TO_TIER = new Map<string, PlanId>();
for (const tier of Object.keys(WHOP_PLAN_IDS) as PaidPlanId[]) {
  for (const interval of Object.keys(WHOP_PLAN_IDS[tier]) as BillingInterval[]) {
    PLAN_ID_TO_TIER.set(WHOP_PLAN_IDS[tier][interval], tier);
  }
}
for (const interval of Object.keys(LEGACY_BASIC_WHOP_PLAN_IDS) as BillingInterval[]) {
  PLAN_ID_TO_TIER.set(LEGACY_BASIC_WHOP_PLAN_IDS[interval], "basic");
}

export function isPaidPlanId(value: string): value is PaidPlanId {
  return value === "plus" || value === "pro";
}

export function getWhopPlanId(
  plan: PaidPlanId,
  interval: BillingInterval,
): string {
  return WHOP_PLAN_IDS[plan][interval];
}

export function planFromWhopPlanId(whopPlanId: string | null | undefined): PlanId | null {
  if (!whopPlanId) return null;
  return PLAN_ID_TO_TIER.get(whopPlanId) ?? null;
}

export function resolveSelectablePlan(plan: PlanId): PlanId {
  return plan === "team" ? "enterprise" : plan;
}
