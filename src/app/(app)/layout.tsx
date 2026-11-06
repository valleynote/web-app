import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/plans";
import { getMonthlyAiUsage } from "@/lib/ai/quota";
import AppSidebar from "@/components/app/AppSidebar";
import AppShellHeader from "@/components/app/AppShellHeader";
import CommandPalette from "@/components/app/CommandPalette";
import CreateNotebookModal from "@/components/app/CreateNotebookModal";
import FeedbackModal from "@/components/app/FeedbackModal";
import MainScrollReset from "@/components/app/MainScrollReset";
import { NoteChromeProvider } from "@/components/editor/NoteChromeContext";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const [subscription, aiUsed, dbUser, notebooks] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    getMonthlyAiUsage(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true, planChosenAt: true },
    }),
    prisma.notebook.findMany({
      where: { userId: session.user.id, archivedAt: null },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        color: true,
        parentId: true,
        _count: {
          select: { notes: { where: { deletedAt: null } } },
        },
      },
    }),
  ]);

  if (!dbUser?.planChosenAt) {
    redirect("/choose-plan");
  }
  const folders = notebooks.map((nb) => ({
    id: nb.id,
    name: nb.name,
    color: nb.color,
    parentId: nb.parentId,
    noteCount: nb._count.notes,
  }));
  const plan = getPlan(subscription?.plan ?? "free");
  const userImage =
    dbUser?.image ??
    (session.user as { image?: string | null }).image ??
    null;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#eceae6] p-2.5 md:p-3">
      <div className="flex min-h-0 min-w-0 flex-1 gap-2.5 md:gap-3">
        <div className="hidden h-full shrink-0 md:block">
          <AppSidebar
            userName={session.user.name}
            userEmail={session.user.email}
            planName={plan.name}
            aiUsed={aiUsed}
            aiLimit={plan.aiActionsPerMonth}
            folders={folders}
          />
        </div>

        <NoteChromeProvider>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-white/70 bg-[#faf9f7] shadow-[0_1px_2px_rgba(26,26,26,0.03),0_12px_40px_rgba(26,26,26,0.05)] md:rounded-[28px]">
            <header className="flex h-14 shrink-0 items-center justify-between px-4 md:hidden">
              <span className="font-inter-tight text-[16px] font-semibold">
                ValleyNote
              </span>
              <a
                href="/app/chat"
                className="inline-flex items-center rounded-[10px] bg-blue px-3 py-1.5 font-switzer text-[12px] font-medium text-white"
              >
                Ask
              </a>
            </header>
            <div className="hidden md:block">
              <AppShellHeader
                userName={session.user.name}
                userEmail={session.user.email}
                userImage={userImage}
              />
            </div>
            <main className="min-h-0 flex-1 overflow-auto">{children}</main>
          </div>
        </NoteChromeProvider>
      </div>
      <MainScrollReset />
      <CommandPalette />
      <CreateNotebookModal />
      <FeedbackModal />
    </div>
  );
}
