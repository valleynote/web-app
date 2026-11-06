"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { assets } from "@/lib/assets";

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Short value + concise label for floating CTA stats. */
const stats = [
  {
    value: "Ask",
    label: "My Notes Anything",
    className:
      "left-[-1%] top-[12%] -rotate-[8deg] md:left-0 md:top-[14%]",
    delay: 0.08,
  },
  {
    value: "Web",
    label: "Works Everywhere",
    className:
      "bottom-[28%] left-[1%] rotate-[6deg] md:bottom-[30%] md:left-[2%]",
    delay: 0.2,
  },
  {
    value: "Fast",
    label: "AI Writing Help",
    className:
      "right-[-1%] top-[10%] rotate-[7deg] md:right-0 md:top-[12%]",
    delay: 0.14,
  },
  {
    value: "24/7",
    label: "Always Available",
    className:
      "bottom-[28%] right-[0%] -rotate-[5deg] md:bottom-[30%] md:right-[1%]",
    delay: 0.26,
  },
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

function Float({
  children,
  className,
  y = 10,
  duration = 5,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
    >
      <motion.div
        animate={{ y: [0, -y, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="relative w-[min(132px,42vw)] sm:w-[148px]">
      <Image
        src={assets.ctaStatPin}
        alt=""
        width={56}
        height={56}
        className="pointer-events-none absolute -top-4 left-1/2 z-20 h-[38px] w-[38px] -translate-x-1/2 drop-shadow-[0_8px_14px_rgba(26,26,26,0.22)] sm:-top-6 sm:h-[56px] sm:w-[56px]"
      />
      <div className="relative overflow-hidden rounded-[14px] shadow-[0_16px_36px_rgba(55,69,241,0.3)]">
        <Image
          src={assets.ctaStatCard}
          alt=""
          width={434}
          height={264}
          className="h-auto w-full select-none"
        />
        <div className="absolute inset-0 flex flex-col items-start justify-center px-3 pt-2 sm:px-4">
          <p className="font-switzer text-[20px] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[26px]">
            {value}
          </p>
          <p className="mt-1 truncate whitespace-nowrap font-inter-tight text-[10px] font-medium leading-none tracking-[-0.02em] text-[#eeeae6] sm:text-[11px]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function CountryMarquee() {
  const row = [...assets.countries, ...assets.countries];

  return (
    <div className="relative mt-6 overflow-hidden md:mt-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-bg to-transparent md:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-bg to-transparent md:w-20" />
      <div className="marquee items-center gap-2.5 px-2 md:gap-3">
        {row.map((country, index) => (
          <span
            key={`${country.name}-${index}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-bg-border bg-white py-1.5 pl-1.5 pr-3.5 shadow-[0_8px_24px_rgba(26,26,26,0.05)]"
          >
            <Image
              src={country.flag}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="font-inter-tight text-[13px] font-medium tracking-[-0.02em] text-ink md:text-[14px]">
              {country.name}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CTA() {
  return (
    <section id="global" className="font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[1140px] space-y-10 md:space-y-12">
          {/* —— Upgrade banner —— */}
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
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.18]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
                    backgroundSize: "72px 72px",
                  }}
                  aria-hidden
                />

                <div className="relative z-10 flex h-full min-h-[200px] flex-col items-start justify-center gap-5 px-5 py-8 sm:px-8 sm:py-10 md:min-h-[220px] md:flex-row md:items-center md:justify-between md:gap-10 md:px-12 md:py-12 lg:px-14">
                  <div className="max-w-[560px]">
                    <h2 className="font-switzer text-[26px] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-[34px] sm:leading-[1.08] md:text-[40px]">
                      Upgrade Your Notes With AI
                    </h2>
                    <p className="mt-3 max-w-[440px] font-inter-tight text-[14px] font-medium leading-relaxed tracking-[-0.01em] text-white/80 md:text-[15px]">
                      Start capturing ideas and get answers grounded
                      <br className="hidden sm:block" />{" "}
                      in what you wrote with ValleyNote.
                    </p>
                  </div>

                  <Link
                    href="/#pricing"
                    className="inline-flex h-[47px] w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-white py-3 pl-5 pr-4 font-inter-tight text-[15px] font-medium tracking-[-0.02em] text-ink shadow-[0_12px_28px_rgba(26,26,26,0.18),inset_0_1px_1px_rgba(255,255,255,0.45)] transition hover:scale-[1.02] hover:bg-white/95 sm:w-auto"
                  >
                    Get Started
                    <ChevronRight />
                  </Link>
                </div>
              </div>
            </motion.div>

            <Image
              src={assets.heroPins.rightAlt}
              alt=""
              width={78}
              height={58}
              className="pointer-events-none absolute left-2 top-1 z-20 hidden h-[58px] w-[78px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)] sm:block md:left-3"
            />
            <Image
              src={assets.heroPins.rightAlt}
              alt=""
              width={78}
              height={58}
              className="pointer-events-none absolute right-2 top-1 z-20 hidden h-[58px] w-[78px] scale-x-[-1] drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)] sm:block md:right-3"
            />
          </div>

          {/* Without Borders — transparent stage, no white card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: easeOut }}
            className="relative"
          >
            <div className="relative min-h-[380px] w-full sm:min-h-[460px] md:min-h-[502px]">
              {/* Map sits on page bg — no white panel */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70 sm:opacity-100">
                <Image
                  src={assets.ctaMap}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1140px) 100vw, 1140px"
                />
              </div>

              {/* Floating stats — desktop */}
              <div
                className="pointer-events-none absolute inset-0 z-20 hidden sm:block"
                aria-hidden
              >
                {stats.map((stat) => (
                  <Float
                    key={stat.label}
                    className={`absolute ${stat.className}`}
                    y={8 + stat.delay * 10}
                    duration={4.8 + stat.delay}
                    delay={stat.delay}
                  >
                    <StatCard value={stat.value} label={stat.label} />
                  </Float>
                ))}
              </div>

              {/* Center copy */}
              <div className="relative z-10 flex min-h-[380px] flex-col items-center justify-center px-4 py-12 text-center sm:min-h-[460px] sm:px-5 sm:py-16 md:min-h-[502px] md:py-20">
                <h2 className="max-w-[520px] font-switzer text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink-soft sm:text-[40px] sm:leading-[1.1] md:text-[48px]">
                  Your Notes
                  <br />
                  Without Borders
                </h2>
                <p className="mt-3 max-w-[420px] font-inter-tight text-[14px] font-medium leading-[1.5] tracking-[-0.01em] text-muted sm:mt-4 sm:text-[15px] md:text-[16px]">
                  Write, search, and ask your notes anywhere with ValleyNote
                  global AI coverage.
                </p>
                <Link
                  href="/signup"
                  className="mt-5 inline-flex h-[47px] w-full max-w-[280px] items-center justify-center gap-1.5 rounded-full bg-ink py-3 pl-5 pr-4 font-inter-tight text-[15px] font-medium tracking-[-0.02em] text-white shadow-[0_14px_32px_rgba(26,26,26,0.22)] transition hover:scale-[1.02] hover:bg-ink/90 sm:mt-6 sm:w-auto md:mt-7"
                >
                  Get Started
                  <ChevronRight />
                </Link>
              </div>
            </div>

            {/* Mobile stats */}
            <div className="relative z-10 mt-4 grid grid-cols-2 justify-items-center gap-4 px-2 sm:mt-2 sm:hidden sm:gap-6 sm:px-5">
              {stats.map((stat) => (
                <StatCard
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                />
              ))}
            </div>

            <div className="relative z-10 px-1">
              <CountryMarquee />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
