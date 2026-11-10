"use client";

import {
  LANDING_PRICING_CARDS,
  PRICING_COMPARISON,
  type PricingCard,
} from "@/lib/plans";

type Billing = "monthly" | "yearly";

function displayPrice(plan: PricingCard, billing: Billing) {
  if (plan.custom) return "Custom";
  if (plan.monthly === 0) return "$0";
  if (billing === "yearly" && plan.yearlyTotal > 0) {
    return `$${Math.round(plan.yearlyTotal / 12)}`;
  }
  return `$${plan.monthly}`;
}

function FeatureSparkle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        d="M6.369 9.906 9.724 11.924c.175.108.399.101.566-.019.168-.12.247-.329.202-.53L9.579 7.607 12.564 5.087c.157-.132.218-.347.155-.542-.063-.195-.239-.332-.443-.347L8.358 3.888 6.848.312C6.767.123 6.58 0 6.374 0c-.206 0-.393.123-.474.312L4.39 3.888.472 4.198c-.205.013-.382.15-.447.345-.064.196-.003.411.154.544L3.164 7.607 2.244 11.375c-.045.201.034.41.202.53.167.12.391.127.566.019Z"
        transform="translate(9.006 2.25)"
        fill="none"
        stroke="#3745F1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.48 0 0 5.48"
        transform="translate(2.25 11.02)"
        stroke="#3745F1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4.993 0 0 4.993"
        transform="translate(3.75 16.757)"
        stroke="#3745F1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5.089 0 0 5.089"
        transform="translate(10.5 16.661)"
        stroke="#3745F1"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckYes() {
  return (
    <span className="inline-flex items-center justify-center gap-1.5 text-[14px] font-medium text-ink-soft md:text-[15px]">
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M16.347 5.66 7.347 14.66a.9.9 0 0 1-1.272 0L2.214 10.723a.9.9 0 1 1 1.273-1.273l3.263 3.263 8.026-8.024a.9.9 0 0 1 1.272 1.272Z"
          fill="#3745F1"
        />
      </svg>
      Yes
    </span>
  );
}

export default function PricingComparison({
  billing,
}: {
  billing: Billing;
  variant?: "marketing" | "app";
}) {
  const plans = LANDING_PRICING_CARDS;
  // Fixed track sizes so scrollWidth matches visible columns on mobile.
  // (fr + undersized min-width + overflow-hidden was clipping the last plans.)
  const featureColPx = 200;
  const planColPx = 156;
  const tableWidthPx = featureColPx + planColPx * plans.length;

  return (
    <div className="mt-12 sm:mt-16 md:mt-20">
      <h3 className="text-center font-inter-tight text-[24px] font-semibold tracking-[-0.03em] text-ink sm:text-[28px] md:text-[36px]">
        Pricing Comparison
      </h3>
      <p className="mt-2 text-center text-[13px] text-muted sm:hidden">
        Swipe to compare plans →
      </p>

      <div className="relative mt-6 min-w-0 sm:mt-8">
        <div className="overflow-x-auto overscroll-x-contain touch-pan-x [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
          <div
            className="overflow-hidden rounded-[16px] border border-bg-line bg-bg sm:rounded-[20px]"
            style={{
              display: "grid",
              width: `max(100%, ${tableWidthPx}px)`,
              gridTemplateColumns: `${featureColPx}px repeat(${plans.length}, minmax(${planColPx}px, 1fr))`,
            }}
          >
            <div className="flex items-end border-b border-r border-bg-line px-4 py-5 sm:px-5 sm:py-6">
              <div className="flex items-center gap-2.5">
                <FeatureSparkle className="h-6 w-6 shrink-0" />
                <span className="font-inter-tight text-[18px] font-semibold tracking-[-0.02em] text-ink sm:text-[20px]">
                  Features
                </span>
              </div>
            </div>

            {plans.map((plan, index) => {
              const price = displayPrice(plan, billing);
              const isLast = index === plans.length - 1;
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col items-center border-b border-bg-line px-3 py-5 text-center sm:px-4 ${
                    isLast ? "" : "border-r"
                  }`}
                >
                  <p className="font-inter-tight text-[16px] font-semibold tracking-[-0.02em] text-ink sm:text-[17px]">
                    {plan.name} Plan
                  </p>
                  <p className="mt-2 font-inter-tight text-[24px] font-semibold tracking-[-0.03em] text-ink md:text-[28px]">
                    {price}
                    {!plan.custom ? (
                      <span className="ml-1 text-[12px] font-medium text-muted sm:text-[13px]">
                        / per month
                      </span>
                    ) : null}
                  </p>
                </div>
              );
            })}

            {PRICING_COMPARISON.map((row, rowIndex) => {
              const isLastRow = rowIndex === PRICING_COMPARISON.length - 1;
              const stripe = rowIndex % 2 === 1 ? "bg-bg-soft/50" : "bg-bg";
              return (
                <div key={row.feature} className="contents">
                  <div
                    className={`flex items-center border-r border-bg-line px-4 py-4 sm:px-5 ${
                      isLastRow ? "" : "border-b"
                    } ${stripe}`}
                  >
                    <span className="text-[13px] font-semibold tracking-[-0.01em] text-ink sm:text-[14px] md:text-[15px]">
                      {row.feature}
                    </span>
                  </div>
                  {plans.map((plan, i) => {
                    const included = Boolean(
                      row[plan.id as keyof typeof row],
                    );
                    return (
                      <div
                        key={`${row.feature}-${plan.id}`}
                        className={`flex items-center justify-center px-3 py-4 sm:px-4 ${
                          i === plans.length - 1 ? "" : "border-r border-bg-line"
                        } ${isLastRow ? "" : "border-b border-bg-line"} ${stripe}`}
                      >
                        {included ? (
                          <CheckYes />
                        ) : (
                          <span className="text-[14px] font-medium text-muted-3">
                            --
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
