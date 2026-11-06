import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/plans";

function monthStartUtc() {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function nextMonthStartUtc() {
  const start = monthStartUtc();
  start.setUTCMonth(start.getUTCMonth() + 1);
  return start;
}

export async function getMonthlyAiUsage(userId: string) {
  return prisma.aiUsage.count({
    where: {
      userId,
      createdAt: { gte: monthStartUtc() },
    },
  });
}

export type UsageFeatureRow = {
  feature: string;
  count: number;
};

export type UsageDayRow = {
  date: string;
  count: number;
};

export type UsageStats = {
  aiUsed: number;
  aiRemaining: number;
  aiLimit: number;
  periodStartIso: string;
  periodEndIso: string;
  noteCount: number;
  notebookCount: number;
  favoriteCount: number;
  tagCount: number;
  chatThreadCount: number;
  attachmentCount: number;
  storageUsedBytes: number;
  tokensIn: number;
  tokensOut: number;
  featureBreakdown: UsageFeatureRow[];
  last7Days: UsageDayRow[];
};

export async function getUsageStats(
  userId: string,
  aiLimit: number,
): Promise<UsageStats> {
  const periodStart = monthStartUtc();
  const periodEnd = nextMonthStartUtc();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);

  const [
    aiUsed,
    noteCount,
    notebookCount,
    favoriteCount,
    tagCount,
    chatThreadCount,
    attachmentAgg,
    tokenAgg,
    featureGroups,
    recentUsage,
  ] = await Promise.all([
    prisma.aiUsage.count({
      where: { userId, createdAt: { gte: periodStart } },
    }),
    prisma.note.count({ where: { userId, deletedAt: null } }),
    prisma.notebook.count({
      where: { userId, archivedAt: null },
    }),
    prisma.note.count({
      where: { userId, deletedAt: null, isFavorite: true },
    }),
    prisma.tag.count({ where: { userId } }),
    prisma.chatThread.count({ where: { userId } }),
    prisma.attachment.aggregate({
      where: { userId },
      _sum: { size: true },
      _count: true,
    }),
    prisma.aiUsage.aggregate({
      where: { userId, createdAt: { gte: periodStart } },
      _sum: { tokensIn: true, tokensOut: true },
    }),
    prisma.aiUsage.groupBy({
      by: ["feature"],
      where: { userId, createdAt: { gte: periodStart } },
      _count: { _all: true },
    }),
    prisma.aiUsage.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const dayCounts = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setUTCDate(sevenDaysAgo.getUTCDate() + i);
    dayCounts.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of recentUsage) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (dayCounts.has(key)) {
      dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
    }
  }

  return {
    aiUsed,
    aiRemaining: Math.max(0, aiLimit - aiUsed),
    aiLimit,
    periodStartIso: periodStart.toISOString(),
    periodEndIso: periodEnd.toISOString(),
    noteCount,
    notebookCount,
    favoriteCount,
    tagCount,
    chatThreadCount,
    attachmentCount: attachmentAgg._count,
    storageUsedBytes: attachmentAgg._sum.size ?? 0,
    tokensIn: tokenAgg._sum.tokensIn ?? 0,
    tokensOut: tokenAgg._sum.tokensOut ?? 0,
    featureBreakdown: featureGroups
      .map((g) => ({
        feature: g.feature,
        count: g._count._all,
      }))
      .sort((a, b) => b.count - a.count),
    last7Days: Array.from(dayCounts.entries()).map(([date, count]) => ({
      date,
      count,
    })),
  };
}

export async function assertAiQuota(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const plan = getPlan(sub?.plan ?? "free");
  const used = await getMonthlyAiUsage(userId);

  if (used >= plan.aiActionsPerMonth) {
    return {
      ok: false as const,
      used,
      limit: plan.aiActionsPerMonth,
      plan: plan.id,
      message: "AI quota reached for this month. Upgrade to Pro for more actions.",
    };
  }

  return {
    ok: true as const,
    used,
    limit: plan.aiActionsPerMonth,
    plan: plan.id,
    remaining: plan.aiActionsPerMonth - used,
  };
}

export async function logAiUsage(input: {
  userId: string;
  feature: string;
  model: string;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
}) {
  await prisma.aiUsage.create({
    data: {
      userId: input.userId,
      feature: input.feature,
      model: input.model,
      tokensIn: input.tokensIn ?? 0,
      tokensOut: input.tokensOut ?? 0,
      costUsd: input.costUsd ?? 0,
    },
  });
}
