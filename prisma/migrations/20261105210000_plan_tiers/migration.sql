-- Add new plan tiers (keep legacy "team" for existing rows)
ALTER TYPE "PlanId" ADD VALUE IF NOT EXISTS 'basic';
ALTER TYPE "PlanId" ADD VALUE IF NOT EXISTS 'plus';
ALTER TYPE "PlanId" ADD VALUE IF NOT EXISTS 'enterprise';
