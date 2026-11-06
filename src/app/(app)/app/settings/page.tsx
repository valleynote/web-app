import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/plans";
import { getUsageStats } from "@/lib/ai/quota";
import { getAppUrl, isWhopConfigured } from "@/lib/whop";
import AppTopBar from "@/components/app/AppTopBar";
import SettingsPanel from "@/components/app/SettingsPanel";

export const metadata = {
  title: "Settings — ValleyNote",
};

export default async function SettingsPage() {
  const session = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { subscription: true },
  });
  const subscription =
    user.subscription ??
    (await prisma.subscription.create({
      data: { userId: user.id, plan: "free", status: "active" },
    }));
  const plan = getPlan(subscription.plan);
  const [usage, dbSessions] = await Promise.all([
    getUsageStats(user.id, plan.aiActionsPerMonth),
    prisma.session.findMany({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <AppTopBar
        title="Settings"
        subtitle="Manage your profile, security, and plan."
        hideActions
      />

      <Suspense fallback={null}>
        <SettingsPanel
          user={{
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt.toISOString(),
          }}
          plan={{
            id: plan.id,
            name: plan.name,
            priceMonthlyUsd: plan.priceMonthlyUsd,
            priceYearlyUsd: plan.priceYearlyUsd,
            maxNotes: plan.maxNotes,
            aiActionsPerMonth: plan.aiActionsPerMonth,
            storageBytes: plan.storageBytes,
            custom: plan.custom,
          }}
          subscription={{
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
            createdAt: subscription.createdAt.toISOString(),
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            whopMembershipId: subscription.whopMembershipId,
          }}
          billing={{
            userId: user.id,
            userEmail: user.email,
            appUrl: getAppUrl(),
            whopConfigured: isWhopConfigured(),
          }}
          sessions={dbSessions.map((row) => ({
            id: row.id,
            token: row.token,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
            expiresAt: row.expiresAt.toISOString(),
            ipAddress: row.ipAddress,
            userAgent: row.userAgent,
            current: row.token === session.session.token,
          }))}
          usage={usage}
        />
      </Suspense>
    </div>
  );
}
