"use client";

import PricingCards from "@/components/pricing/PricingCards";

export default function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-28 font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[1140px]">
          <div className="text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-blue">
              Pricing
            </p>
            <h2 className="mt-3 font-inter-tight text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px] md:text-[44px] md:leading-[1.1]">
              Choose a plan that fits
            </h2>
          </div>

          <div className="mt-8 sm:mt-10">
            <PricingCards variant="marketing" showComparison />
          </div>
        </div>
      </div>
    </section>
  );
}
