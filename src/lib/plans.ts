import type { PlanId } from "@/generated/prisma/client";

export type PlanLimits = {
  id: PlanId;
  name: string;
  priceMonthlyUsd: number;
  priceYearlyUsd: number;
  maxNotes: number | null;
  aiActionsPerMonth: number;
  storageBytes: number;
  /** Custom / sales-led plan */
  custom?: boolean;
  comingSoon?: boolean;
};

/** Account default before upgrade — not shown as a paid pricing card. */
export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthlyUsd: 0,
    priceYearlyUsd: 0,
    maxNotes: 100,
    aiActionsPerMonth: 40,
    storageBytes: 100 * 1024 * 1024,
  },
  /** @deprecated no longer sold — kept for existing DB rows */
  basic: {
    id: "basic",
    name: "Basic",
    priceMonthlyUsd: 4,
    priceYearlyUsd: 40,
    maxNotes: 2500,
    aiActionsPerMonth: 80,
    storageBytes: 2 * 1024 * 1024 * 1024,
  },
  plus: {
    id: "plus",
    name: "Plus",
    priceMonthlyUsd: 6,
    priceYearlyUsd: 60,
    maxNotes: 10000,
    aiActionsPerMonth: 350,
    storageBytes: 10 * 1024 * 1024 * 1024,
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthlyUsd: 11,
    priceYearlyUsd: 110,
    maxNotes: null,
    aiActionsPerMonth: 1500,
    storageBytes: 50 * 1024 * 1024 * 1024,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthlyUsd: 0,
    priceYearlyUsd: 0,
    maxNotes: null,
    aiActionsPerMonth: 10000,
    storageBytes: 500 * 1024 * 1024 * 1024,
    custom: true,
  },
  /** @deprecated kept for existing DB rows — treated as Enterprise */
  team: {
    id: "team",
    name: "Enterprise",
    priceMonthlyUsd: 0,
    priceYearlyUsd: 0,
    maxNotes: null,
    aiActionsPerMonth: 10000,
    storageBytes: 500 * 1024 * 1024 * 1024,
    custom: true,
  },
};

export function getPlan(plan: PlanId = "free"): PlanLimits {
  const resolved = plan === "team" ? "enterprise" : plan;
  return PLANS[resolved] ?? PLANS.free;
}

export type PricingFeatureKey =
  | "editor"
  | "notebooksTags"
  | "images"
  | "videoEmbeds"
  | "voiceNotes"
  | "writingAssistant"
  | "summarize"
  | "askNotes"
  | "autoTitleTag"
  | "tasksRelated"
  | "prioritySupport"
  | "customSso";

export type PricingCard = {
  id: "free" | "plus" | "pro" | "enterprise";
  name: string;
  tagline: string;
  monthly: number;
  yearlyTotal: number;
  cta: string;
  /** Marketing CTA */
  hrefMarketing: string;
  /** In-app dashboard CTA */
  hrefApp: string;
  popular: boolean;
  custom: boolean;
  features: string[];
};

/** Free starter — shown on marketing / plans pages, not checkout cards. */
export const FREE_PRICING_CARD: PricingCard = {
  id: "free",
  name: "Free",
  tagline: "Start organizing with cloud notes and a light AI allowance.",
  monthly: 0,
  yearlyTotal: 0,
  cta: "Get started free",
  hrefMarketing: "/signup",
  hrefApp: "/app",
  popular: false,
  custom: false,
  features: [
    "Up to 100 notes in the cloud",
    "40 AI actions / month",
    "100 MB storage",
    "Smart editor & notebooks",
    "Images in notes",
  ],
};

/** Paid + Enterprise cards used by in-app billing checkout. */
export const PRICING_CARDS: PricingCard[] = [
  {
    id: "plus",
    name: "Plus",
    tagline: "Voice notes and Ask my notes for everyday creators.",
    monthly: 6,
    yearlyTotal: 60,
    cta: "Choose Plus",
    hrefMarketing: "/signup",
    hrefApp: "/checkout?plan=plus&interval=monthly",
    popular: true,
    custom: false,
    features: [
      "Everything in Free",
      "Up to 10,000 notes",
      "350 AI actions / month",
      "10 GB storage",
      "Voice notes (record → transcript)",
      "Ask my notes (semantic + keyword)",
      "One-click summaries",
      "Saved chat history",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Full agentic toolkit for heavy writers and power users.",
    monthly: 11,
    yearlyTotal: 110,
    cta: "Choose Pro",
    hrefMarketing: "/signup",
    hrefApp: "/checkout?plan=pro&interval=monthly",
    popular: false,
    custom: false,
    features: [
      "Everything in Plus",
      "Unlimited notes",
      "1,500 AI actions / month",
      "50 GB storage",
      "Auto-title & auto-tag",
      "Turn into tasks + related notes",
      "Priority email support",
      "Early access to new AI tools",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom limits, security, and onboarding for your organization.",
    monthly: 0,
    yearlyTotal: 0,
    cta: "Contact sales",
    hrefMarketing: "/contact",
    hrefApp: "/contact",
    popular: false,
    custom: true,
    features: [
      "Everything in Pro",
      "Custom AI & storage limits",
      "Dedicated onboarding",
      "SSO & admin controls (roadmap)",
      "Security review & DPA",
      "Priority success manager",
    ],
  },
];

/** Public plans for the landing page and plans overview. */
export const LANDING_PRICING_CARDS: PricingCard[] = [
  FREE_PRICING_CARD,
  ...PRICING_CARDS,
];

export const PRICING_INCLUDED = [
  "Smart editor",
  "Cloud notebooks",
  "Images & embeds",
  "Secure sync",
];

export type ComparisonRow = {
  feature: string;
  free: boolean;
  plus: boolean;
  pro: boolean;
  enterprise: boolean;
};

export const PRICING_COMPARISON: ComparisonRow[] = [
  { feature: "Smart editor & notebooks", free: true, plus: true, pro: true, enterprise: true },
  { feature: "Images in notes", free: true, plus: true, pro: true, enterprise: true },
  { feature: "Video embeds", free: false, plus: true, pro: true, enterprise: true },
  { feature: "Writing assistant", free: false, plus: true, pro: true, enterprise: true },
  { feature: "Voice notes", free: false, plus: true, pro: true, enterprise: true },
  { feature: "Ask my notes (RAG)", free: false, plus: true, pro: true, enterprise: true },
  { feature: "Summarize", free: false, plus: true, pro: true, enterprise: true },
  { feature: "Auto-title & auto-tag", free: false, plus: false, pro: true, enterprise: true },
  { feature: "Tasks & related notes", free: false, plus: false, pro: true, enterprise: true },
  { feature: "Unlimited notes", free: false, plus: false, pro: true, enterprise: true },
  { feature: "Priority support", free: false, plus: false, pro: true, enterprise: true },
  { feature: "Custom limits & SSO", free: false, plus: false, pro: false, enterprise: true },
];

export function formatStorage(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${bytes / (1024 * 1024 * 1024)} GB`;
  }
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}
