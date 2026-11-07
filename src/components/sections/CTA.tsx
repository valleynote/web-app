"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { assets } from "@/lib/assets";

const easeOut = [0.22, 1, 0.36, 1] as const;

const highlights = [
  { value: "Ask", label: "Answers from your notes" },
  { value: "Write", label: "Summarize & rewrite inline" },
  { value: "Find", label: "Search by meaning" },
  { value: "Keep", label: "Tags that stay tidy" },
] as const;

function ChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M9 5.5 15.5 12 9 18.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CTA() {
  return (
    <section id="global" className="font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[1140px] space-y-8 md:space-y-10">
          <div className="relative overflow-visible pt-5 md:pt-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: easeOut }}
              className="relative overflow-hidden rounded-[24px] shadow-[0_28px_70px_rgba(55,69,241,0.28)] md:rounded-[28px]"
            >
              <div className="relative min-h-[200px] md:min-h-[220px]">
                <Image
                  src={assets.ctaWide}
                  alt=""
                  fill
                  className="pointer-events-none object-cover"
                  sizes="(max-width: 1140px) 100vw, 1140px"
                  priority={false}
                />
                <div className="noise absolute inset-0 opacity-60" aria-hidden />

                <div className="relative z-10 flex h-full min-h-[200px] flex-col items-start justify-center gap-5 px-5 py-8 sm:px-8 sm:py-10 md:min-h-[220px] md:flex-row md:items-center md:justify-between md:gap-10 md:px-12 md:py-12 lg:px-14">
                  <div className="max-w-[560px]">
                    <h2 className="font-switzer text-[26px] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-[34px] sm:leading-[1.08] md:text-[40px]">
                      Keep every note ready to ask
                    </h2>
                    <p className="mt-3 max-w-[440px] font-inter-tight text-[14px] font-medium leading-relaxed tracking-[-0.01em] text-white/80 md:text-[15px]">
                      Capture ideas once, then search, summarize, and get cited
                      answers from what you actually wrote.
                    </p>
                  </div>

                  <Link
                    href="/signup"
                    className="inline-flex h-[47px] w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-white py-3 pl-5 pr-4 font-inter-tight text-[15px] font-medium tracking-[-0.02em] text-ink shadow-[0_12px_28px_rgba(26,26,26,0.18)] transition hover:scale-[1.02] hover:bg-white/95 sm:w-auto"
                  >
                    Start free
                    <ChevronRight />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-[16px] border border-bg-border bg-white px-4 py-4 shadow-[0_10px_28px_rgba(26,26,26,0.04)]"
              >
                <p className="font-switzer text-[22px] font-semibold tracking-[-0.04em] text-ink sm:text-[24px]">
                  {item.value}
                </p>
                <p className="mt-1 font-inter-tight text-[12px] font-medium leading-snug text-muted sm:text-[13px]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
