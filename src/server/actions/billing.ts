"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { markSubscriptionCanceled, syncPaymentForUser } from "@/lib/billing";
import { getPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import {
  getAppUrl,
  getWhopAccountId,
  getWhopClient,
  isWhopConfigured,
} from "@/lib/whop";
import {
  getWhopPlanId,
  isPaidPlanId,
  type BillingInterval,
  type PaidPlanId,
} from "@/lib/whop-plans";

const checkoutSchema = z.object({
  plan: z.enum(["plus", "pro"]),
  interval: z.enum(["monthly", "yearly"]),
});

const paymentSchema = z.object({
  paymentId: z.string().min(3).max(128),
});

const confirmSchema = z.object({
  confirmationToken: z.string().min(8).max(512),
  plan: z.enum(["plus", "pro"]),
  interval: z.enum(["monthly", "yearly"]),
  returnUrl: z.string().url().max(2048),
});

export async function getCheckoutSessionAction(input: {
  plan: PaidPlanId;
  interval: BillingInterval;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" as const };

  if (!isWhopConfigured()) {
    return { error: "Payments are not configured yet" as const };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid plan" as const };

  const whopPlanId = getWhopPlanId(parsed.data.plan, parsed.data.interval);
  const plan = getPlan(parsed.data.plan);

  return {
    ok: true as const,
    whopPlanId,
    planId: parsed.data.plan,
    planName: plan.name,
    interval: parsed.data.interval,
    userId: session.user.id,
    userEmail: session.user.email,
  };
}

export async function syncWhopPaymentAction(input: { paymentId: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" as const };

  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid payment" as const };

  try {
    const result = await syncPaymentForUser({
      userId: session.user.id,
      paymentId: parsed.data.paymentId,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidatePath("/app");
    revalidatePath("/app/settings");
    revalidatePath("/app/plans");
    revalidatePath("/choose-plan");
    revalidatePath("/checkout");
    revalidatePath("/checkout/complete");
    return result;
  } catch (err) {
    console.error("syncWhopPaymentAction failed", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not confirm payment yet. Refresh in a moment.",
    };
  }
}

export async function confirmWhopPaymentAction(input: {
  confirmationToken: string;
  plan: PaidPlanId;
  interval: BillingInterval;
  returnUrl: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" as const };

  if (!isWhopConfigured()) {
    return { error: "Payments are not configured yet" as const };
  }

  const parsed = confirmSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid payment request" as const };

  const appUrl = getAppUrl();
  if (
    !parsed.data.returnUrl.startsWith(appUrl) &&
    !parsed.data.returnUrl.startsWith("http://localhost")
  ) {
    return { error: "Invalid return URL" as const };
  }

  const whopPlanId = getWhopPlanId(parsed.data.plan, parsed.data.interval);

  try {
    const whop = getWhopClient();
    const payment = await whop.payments.create({
      account_id: getWhopAccountId(),
      variant_id: whopPlanId,
      confirmation_token: parsed.data.confirmationToken,
      email: session.user.email,
      return_url: parsed.data.returnUrl,
      metadata: {
        user_id: session.user.id,
        plan: parsed.data.plan,
        interval: parsed.data.interval,
      },
    });

    return {
      ok: true as const,
      paymentId: payment.id,
      status: payment.status,
      clientSecret: payment.client_secret,
    };
  } catch (err) {
    console.error("confirmWhopPaymentAction failed", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not create payment. Try again.",
    };
  }
}

export async function chooseFreePlanAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" as const };

  const existing = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { planChosenAt: true },
  });

  if (existing?.planChosenAt) {
    return { ok: true as const, alreadyChosen: true as const };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { planChosenAt: new Date() },
    }),
    prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        plan: "free",
        status: "active",
      },
      update: {},
    }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "onboarding.plan_chosen",
        meta: { plan: "free" },
      },
    }),
  ]);

  revalidatePath("/app");
  revalidatePath("/choose-plan");
  return { ok: true as const };
}

export async function cancelSubscriptionAction(input?: {
  immediate?: boolean;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" as const };

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription || subscription.plan === "free") {
    return { error: "You are already on the Free plan" as const };
  }

  const immediate = Boolean(input?.immediate);

  if (subscription.whopMembershipId && isWhopConfigured()) {
    try {
      const whop = getWhopClient();
      await whop.memberships.cancel({
        id: subscription.whopMembershipId,
        cancel_at_period_end: !immediate,
        reason: immediate
          ? "Downgraded to Free immediately"
          : "Canceled at period end from ValleyNote settings",
      });
    } catch (err) {
      console.error("Whop cancel failed", err);
      return {
        error:
          err instanceof Error
            ? err.message
            : "Could not cancel Whop subscription",
      };
    }
  }

  await markSubscriptionCanceled({
    userId: session.user.id,
    whopMembershipId: subscription.whopMembershipId,
    atPeriodEnd: !immediate,
    currentPeriodEnd: subscription.currentPeriodEnd,
  });

  if (immediate) {
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "subscription.canceled_immediate",
        meta: { previousPlan: subscription.plan },
      },
    });
  } else {
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "subscription.cancel_at_period_end",
        meta: {
          previousPlan: subscription.plan,
          currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
        },
      },
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  revalidatePath("/app/plans");

  return {
    ok: true as const,
    immediate,
    planName: immediate ? "Free" : getPlan(subscription.plan).name,
  };
}

export async function resumeSubscriptionAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" as const };

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.whopMembershipId || !subscription.cancelAtPeriodEnd) {
    return { error: "No pending cancellation to resume" as const };
  }

  if (!isWhopConfigured()) {
    return { error: "Payments are not configured yet" as const };
  }

  try {
    const whop = getWhopClient();
    // Reversing cancel_at_period_end via membership update
    await whop.memberships.update({
      id: subscription.whopMembershipId,
      cancel_at_period_end: false,
    });
  } catch (err) {
    console.error("Whop resume failed", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not resume subscription",
    };
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { cancelAtPeriodEnd: false, status: "active" },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "subscription.resumed",
      meta: { plan: subscription.plan },
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true as const, planName: getPlan(subscription.plan).name };
}

export async function assertPaidPlanCheckout(plan: string) {
  if (!isPaidPlanId(plan)) return false;
  return true;
}
