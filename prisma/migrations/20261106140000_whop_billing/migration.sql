-- AlterTable
ALTER TABLE "subscription" ADD COLUMN IF NOT EXISTS "whopMembershipId" TEXT;
ALTER TABLE "subscription" ADD COLUMN IF NOT EXISTS "whopPlanId" TEXT;
ALTER TABLE "subscription" ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "subscription_whopMembershipId_idx" ON "subscription"("whopMembershipId");
