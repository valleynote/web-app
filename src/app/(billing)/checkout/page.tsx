import { redirect } from "next/navigation";
import CheckoutPageClient from "@/components/billing/CheckoutPageClient";
import { requireSession } from "@/lib/session";
import { getAppUrl, getWhopAccountId, isWhopConfigured } from "@/lib/whop";
import { isPaidPlanId, type BillingInterval } from "@/lib/whop-plans";

export const metadata = {
  title: "Checkout — ValleyNote",
};

type Search = {
  plan?: string;
  interval?: string;
  from?: string;
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const plan = params.plan ?? "plus";
  const intervalParam = params.interval === "yearly" ? "yearly" : "monthly";
  const interval = intervalParam as BillingInterval;

  if (!isPaidPlanId(plan)) {
    redirect("/choose-plan");
  }

  let accountId = "";
  try {
    accountId = isWhopConfigured() ? getWhopAccountId() : "";
  } catch {
    accountId = "";
  }

  const sandbox = process.env.WHOP_ENVIRONMENT === "sandbox";

  return (
    <CheckoutPageClient
      planId={plan}
      interval={interval}
      accountId={accountId}
      userId={session.user.id}
      userEmail={session.user.email}
      userName={session.user.name}
      appUrl={getAppUrl()}
      fromOnboarding={params.from === "onboarding"}
      whopConfigured={isWhopConfigured()}
      sandbox={sandbox}
    />
  );
}
