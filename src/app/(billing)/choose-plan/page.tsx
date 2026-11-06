import { redirect } from "next/navigation";
import ChoosePlanClient from "@/components/billing/ChoosePlanClient";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { isWhopConfigured } from "@/lib/whop";

export const metadata = {
  title: "Choose a plan — ValleyNote",
};

export default async function ChoosePlanPage() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { planChosenAt: true, name: true },
  });

  if (user?.planChosenAt) {
    redirect("/app");
  }

  return (
    <ChoosePlanClient
      userName={user?.name ?? session.user.name}
      whopConfigured={isWhopConfigured()}
    />
  );
}
