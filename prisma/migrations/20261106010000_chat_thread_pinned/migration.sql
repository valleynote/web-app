-- AlterTable
ALTER TABLE "chat_thread" ADD COLUMN "pinnedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "chat_thread_userId_pinnedAt_idx" ON "chat_thread"("userId", "pinnedAt");
