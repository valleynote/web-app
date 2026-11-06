import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { deletedAt: true },
  });

  if (!user || user.deletedAt) {
    await prisma.session.deleteMany({ where: { userId: session.user.id } });
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    redirect("/app");
  }
  return session;
}
