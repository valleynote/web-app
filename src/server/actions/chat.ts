"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

export async function listChatThreadsAction() {
  const userId = await requireUserId();
  const threads = await prisma.chatThread.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }],
    take: 40,
    select: {
      id: true,
      title: true,
      pinnedAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });

  return threads.sort((a, b) => {
    const aPinned = a.pinnedAt ? 1 : 0;
    const bPinned = b.pinnedAt ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export async function getChatThreadAction(threadId: string) {
  const userId = await requireUserId();
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 100,
      },
    },
  });
  return thread;
}

export async function renameChatThreadAction(threadId: string, title: string) {
  const userId = await requireUserId();
  const next = z.string().trim().min(1).max(80).parse(title);

  const result = await prisma.chatThread.updateMany({
    where: { id: threadId, userId },
    data: { title: next },
  });
  if (result.count === 0) throw new Error("Chat not found");
  return { id: threadId, title: next };
}

export async function togglePinChatThreadAction(threadId: string) {
  const userId = await requireUserId();
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, userId },
    select: { id: true, pinnedAt: true },
  });
  if (!thread) throw new Error("Chat not found");

  const pinnedAt = thread.pinnedAt ? null : new Date();
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { pinnedAt },
  });
  return { id: threadId, pinned: Boolean(pinnedAt) };
}

export async function deleteChatThreadAction(threadId: string) {
  const userId = await requireUserId();
  await prisma.chatThread.deleteMany({
    where: { id: threadId, userId },
  });
}

export async function rateChatMessageAction(
  messageId: string,
  feedback: "up" | "down" | null,
) {
  const userId = await requireUserId();
  const message = await prisma.chatMessage.findFirst({
    where: {
      id: messageId,
      role: "assistant",
      thread: { userId },
    },
    select: { id: true, citations: true },
  });
  if (!message) throw new Error("Message not found");

  const prev =
    message.citations &&
    typeof message.citations === "object" &&
    !Array.isArray(message.citations)
      ? (message.citations as Record<string, unknown>)
      : {};

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      citations: {
        ...prev,
        feedback,
      },
    },
  });

  return { id: messageId, feedback };
}
