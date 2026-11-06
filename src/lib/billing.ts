import type { PlanId, SubscriptionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/plans";
import { getWhopClient, isWhopConfigured } from "@/lib/whop";
import {
  isPaidPlanId,
  planFromWhopPlanId,
  type PaidPlanId,
} from "@/lib/whop-plans";

type FulfilledPlanId = PaidPlanId | "basic";

type FulfillInput = {
  userId: string;
  plan: FulfilledPlanId;
  whopPlanId?: string | null;
  whopMembershipId?: string | null;
  currentPeriodEnd?: Date | null;
  status?: SubscriptionStatus;
  paymentId?: string | null;
};

function resolvePlanId(value: string | null): FulfilledPlanId | null {
  if (!value) return null;
  if (value === "basic" || isPaidPlanId(value)) return value;
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function metadataString(
  metadata: unknown,
  key: string,
): string | null {
  const record = asRecord(metadata);
  if (!record) return null;
  return asString(record[key]);
}

export async function fulfillPaidSubscription(input: FulfillInput) {
  const existing = await prisma.subscription.findUnique({
    where: { userId: input.userId },
  });

  const previousMembershipId = existing?.whopMembershipId;
  const periodEnd =
    input.currentPeriodEnd ??
    (() => {
      const d = new Date();
      d.setUTCMonth(d.getUTCMonth() + 1);
      return d;
    })();

  const subscription = await prisma.subscription.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      plan: input.plan,
      status: input.status ?? "active",
      whopPlanId: input.whopPlanId ?? null,
      whopMembershipId: input.whopMembershipId ?? null,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
    update: {
      plan: input.plan,
      status: input.status ?? "active",
      whopPlanId: input.whopPlanId ?? null,
      whopMembershipId: input.whopMembershipId ?? null,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  if (
    previousMembershipId &&
    input.whopMembershipId &&
    previousMembershipId !== input.whopMembershipId &&
    isWhopConfigured()
  ) {
    try {
      const whop = getWhopClient();
      await whop.memberships.cancel({
        id: previousMembershipId,
        cancel_at_period_end: false,
        reason: "Replaced by a different ValleyNote plan",
      });
    } catch (err) {
      console.error("Failed to cancel previous Whop membership", {
        previousMembershipId,
        err,
      });
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: input.userId },
      data: { planChosenAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: "subscription.whop_fulfilled",
        meta: {
          plan: input.plan,
          planName: getPlan(input.plan).name,
          whopPlanId: input.whopPlanId ?? null,
          whopMembershipId: input.whopMembershipId ?? null,
          paymentId: input.paymentId ?? null,
        },
      },
    }),
  ]);

  return subscription;
}

export async function markSubscriptionCanceled(input: {
  userId?: string | null;
  whopMembershipId?: string | null;
  atPeriodEnd?: boolean;
  currentPeriodEnd?: Date | null;
}) {
  const existing = input.userId
    ? await prisma.subscription.findUnique({ where: { userId: input.userId } })
    : input.whopMembershipId
      ? await prisma.subscription.findFirst({
          where: { whopMembershipId: input.whopMembershipId },
        })
      : null;

  if (!existing) return null;

  if (input.atPeriodEnd) {
    return prisma.subscription.update({
      where: { id: existing.id },
      data: {
        cancelAtPeriodEnd: true,
        currentPeriodEnd: input.currentPeriodEnd ?? existing.currentPeriodEnd,
      },
    });
  }

  return prisma.subscription.update({
    where: { id: existing.id },
    data: {
      plan: "free",
      status: "canceled",
      cancelAtPeriodEnd: false,
      whopMembershipId: null,
      whopPlanId: null,
      currentPeriodEnd: input.currentPeriodEnd ?? existing.currentPeriodEnd,
    },
  });
}

export async function applyMembershipPayload(membership: Record<string, unknown>) {
  const membershipId = asString(membership.id);
  const metadata = membership.metadata;
  const userId =
    metadataString(metadata, "user_id") ||
    metadataString(metadata, "userId");
  const planFromMeta =
    metadataString(metadata, "plan") ||
    metadataString(metadata, "plan_id");

  const planIdFromVariant =
    asString(asRecord(membership.plan)?.id) ||
    asString(asRecord(membership.variant)?.id) ||
    asString(membership.plan_id) ||
    asString(membership.variant_id);

  const plan =
    resolvePlanId(planFromMeta) ||
    resolvePlanId(planFromWhopPlanId(planIdFromVariant));

  const statusRaw = asString(membership.status);
  const cancelAtPeriodEnd = Boolean(membership.cancel_at_period_end);
  const renewsAt =
    asString(membership.renewal_period_end) ||
    asString(membership.current_period_end);

  const periodEnd = renewsAt ? new Date(renewsAt) : null;

  if (statusRaw === "canceled" || statusRaw === "expired") {
    return markSubscriptionCanceled({
      userId,
      whopMembershipId: membershipId,
      atPeriodEnd: false,
      currentPeriodEnd: periodEnd,
    });
  }

  if (cancelAtPeriodEnd) {
    return markSubscriptionCanceled({
      userId,
      whopMembershipId: membershipId,
      atPeriodEnd: true,
      currentPeriodEnd: periodEnd,
    });
  }

  if (!userId || !plan) {
    console.warn("Whop membership missing user/plan mapping", {
      membershipId,
      userId,
      plan,
      planIdFromVariant,
    });
    return null;
  }

  const status: SubscriptionStatus =
    statusRaw === "trialing"
      ? "trialing"
      : statusRaw === "past_due"
        ? "past_due"
        : "active";

  return fulfillPaidSubscription({
    userId,
    plan,
    whopPlanId: planIdFromVariant,
    whopMembershipId: membershipId,
    currentPeriodEnd: periodEnd,
    status,
  });
}

export async function applyPaymentSucceeded(payment: Record<string, unknown>) {
  const paymentId = asString(payment.id);
  const metadata = payment.metadata;
  const userId =
    metadataString(metadata, "user_id") ||
    metadataString(metadata, "userId");
  const planFromMeta =
    metadataString(metadata, "plan") ||
    metadataString(metadata, "plan_id");

  const membershipId =
    asString(payment.membership_id) ||
    asString(asRecord(payment.membership)?.id);

  const planIdFromVariant =
    asString(payment.plan_id) ||
    asString(payment.variant_id) ||
    asString(asRecord(payment.plan)?.id) ||
    asString(asRecord(payment.variant)?.id);

  const plan =
    resolvePlanId(planFromMeta) ||
    resolvePlanId(planFromWhopPlanId(planIdFromVariant));

  if (!userId || !plan) {
    console.warn("Whop payment missing user/plan mapping", {
      paymentId,
      userId,
      plan,
      planIdFromVariant,
    });
    return null;
  }

  let periodEnd: Date | null = null;
  if (membershipId && isWhopConfigured()) {
    try {
      const whop = getWhopClient();
      const membership = await whop.memberships.retrieve({ id: membershipId });
      const membershipRecord = membership as unknown as Record<string, unknown>;
      const renewsAt =
        asString(membershipRecord.renewal_period_end) ||
        asString(membershipRecord.current_period_end);
      if (renewsAt) periodEnd = new Date(renewsAt);
    } catch (err) {
      console.error("Failed to retrieve Whop membership after payment", err);
    }
  }

  return fulfillPaidSubscription({
    userId,
    plan,
    whopPlanId: planIdFromVariant,
    whopMembershipId: membershipId,
    currentPeriodEnd: periodEnd,
    status: "active",
    paymentId,
  });
}

export async function syncPaymentForUser(input: {
  userId: string;
  paymentId: string;
}) {
  if (!isWhopConfigured()) {
    return { error: "Whop is not configured" as const };
  }

  const whop = getWhopClient();
  const payment = await whop.payments.retrieve({ id: input.paymentId });
  const record = payment as unknown as Record<string, unknown>;
  const status = asString(record.status);

  if (status !== "paid" && status !== "succeeded" && status !== "complete") {
    // Some payments may still be processing; allow metadata check either way.
    const subStatus = asString(record.substatus);
    if (subStatus !== "succeeded" && status !== "pending") {
      return { error: "Payment is not complete yet" as const, status };
    }
  }

  const metadataUserId =
    metadataString(record.metadata, "user_id") ||
    metadataString(record.metadata, "userId");

  if (metadataUserId && metadataUserId !== input.userId) {
    return { error: "Payment does not belong to this account" as const };
  }

  // Ensure metadata carries this user before fulfill (in case checkout omitted it).
  const metadata = {
    ...(asRecord(record.metadata) ?? {}),
    user_id: input.userId,
  };
  const enriched = { ...record, metadata };

  const subscription = await applyPaymentSucceeded(enriched);
  if (!subscription) {
    return { error: "Could not map payment to a plan" as const };
  }

  return {
    ok: true as const,
    plan: subscription.plan as PlanId,
    planName: getPlan(subscription.plan).name,
  };
}
