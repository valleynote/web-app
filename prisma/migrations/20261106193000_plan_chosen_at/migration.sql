-- AlterTable
ALTER TABLE "user" ADD COLUMN "planChosenAt" TIMESTAMP(3);

-- Existing accounts already picked (or inherited) a plan — skip onboarding gate.
UPDATE "user" SET "planChosenAt" = "createdAt" WHERE "planChosenAt" IS NULL AND "deletedAt" IS NULL;
