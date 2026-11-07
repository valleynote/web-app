"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { assets } from "@/lib/assets";

const easeOut = [0.22, 1, 0.36, 1] as const;

const headlineLines = ["Open your notes.", "Ask anything."] as const;

const headlineContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.028,
      delayChildren: 0.08,
    },
  },
};

const headlineLetter = {
  hidden: {
    opacity: 0,
    y: 10,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      ease: easeOut,
    },
  },
};

function AnimatedHeadline({ className }: { className?: string }) {
  let charIndex = 0;

  return (
    <motion.h2
      className={className}
      variants={headlineContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.55 }}
      aria-label="Open your notes. Ask anything."
    >
      {headlineLines.map((line) => (
        <span key={line} className="block">
          {line.split(" ").map((word, wordIndex, words) => (
            <span key={`${line}-${wordIndex}`} className="inline-block whitespace-nowrap">
              {word.split("").map((char) => {
                const i = charIndex++;
                return (
                  <motion.span
                    key={`${line}-${i}`}
                    variants={headlineLetter}
                    className="inline-block will-change-transform"
                  >
                    {char}
                  </motion.span>
                );
              })}
              {wordIndex < words.length - 1 ? (
                <span className="inline-block">&nbsp;</span>
              ) : null}
            </span>
          ))}
        </span>
      ))}
    </motion.h2>
  );
}

function CtaBadge({
  size = 64,
  gradient,
  children,
}: {
  size?: number;
  gradient: [string, string];
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        boxShadow:
          "0 14px 30px rgba(26,26,26,0.22), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 6px rgba(0,0,0,0.18)",
      }}
      aria-hidden
    >
      {children}
    </div>
  );
}

function NotebookBadge({ size = 64 }: { size?: number }) {
  const icon = Math.round(size * 0.42);
  return (
    <CtaBadge size={size} gradient={["#ffffff", "#f0ebe4"]}>
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none">
        <path
          d="M7 3.5h9.5A2.5 2.5 0 0 1 19 6v12a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Z"
          stroke="#1a1a1a"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M8.5 3.5v17" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M11.5 8h4.5M11.5 12h4.5M11.5 16h3"
          stroke="#1a1a1a"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </CtaBadge>
  );
}

function SparkBadge({ size = 56 }: { size?: number }) {
  const icon = Math.round(size * 0.58);
  return (
    <CtaBadge size={size} gradient={["#8dff5c", "#62ff2e"]}>
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3.5 13.7 9.3 19.5 11 13.7 12.7 12 18.5 10.3 12.7 4.5 11 10.3 9.3 12 3.5Z"
          fill="#1a1a1a"
        />
        <path
          d="M18.2 4.2 18.85 6.35 21 7 18.85 7.65 18.2 9.8 17.55 7.65 15.4 7 17.55 6.35 18.2 4.2Z"
          fill="#1a1a1a"
        />
      </svg>
    </CtaBadge>
  );
}

function Float({
  children,
  className,
  y = 10,
  duration = 4.8,
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
      viewport={{ once: true, amount: 0.35 }}
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

export default function FinalCTA() {
  return (
    <section className="relative overflow-x-clip px-4 font-switzer sm:px-5">
      <div className="relative mx-auto w-full max-w-[1140px]">
        <div className="relative">
          <div className="relative min-h-[420px] overflow-hidden rounded-[18px] sm:min-h-[480px] sm:rounded-[20px] md:min-h-[574px] md:rounded-[24px]">
            <Image
              src={assets.finalCta}
              alt=""
              fill
              className="pointer-events-none object-cover"
              sizes="(max-width: 1140px) 100vw, 1140px"
            />

            <div className="relative z-10 flex h-full min-h-[420px] flex-col items-center justify-center px-4 py-14 text-center sm:min-h-[480px] sm:px-10 sm:py-20 md:min-h-[574px] md:px-16 md:py-24">
              <p className="font-dm-mono text-[12px] font-medium uppercase tracking-[0.08em] text-white sm:text-[13px] md:text-[14px]">
                Your notebook, ready
              </p>

              <AnimatedHeadline className="mt-2 max-w-[760px] font-switzer text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[44px] sm:leading-[1.1] md:text-[54px]" />

              <p className="mt-3 max-w-[560px] font-inter-tight text-[14px] font-medium leading-[1.5] tracking-[-0.02em] text-[#eae5e0] sm:mt-4 sm:text-[15px] md:mt-5 md:text-[16px]">
                Capture ideas, ask your notes anything, and get answers
                <br className="hidden sm:block" />{" "}
                grounded in what you actually wrote.
              </p>

              <div className="mt-7 grid w-full max-w-[320px] grid-cols-1 gap-2.5 sm:mt-10 sm:flex sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-[47px] items-center justify-center rounded-full border border-white/90 px-5 font-inter-tight text-[15px] font-medium tracking-[-0.02em] text-white transition hover:bg-white/10"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-[47px] items-center justify-center gap-1.5 rounded-full bg-white py-3 pl-4 pr-3 font-inter-tight text-[15px] font-medium tracking-[-0.02em] text-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition hover:bg-white/95"
                >
                  Get Started
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className="shrink-0"
                  >
                    <path
                      d="M9 5.5 15.5 12 9 18.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <Float
            className="pointer-events-none absolute bottom-6 left-8 z-20 hidden sm:block md:bottom-8 md:left-10"
            y={10}
            duration={5.2}
            delay={0.15}
          >
            <NotebookBadge size={68} />
          </Float>
          <Float
            className="pointer-events-none absolute bottom-6 right-8 z-20 hidden sm:block md:bottom-8 md:right-10"
            y={12}
            duration={4.6}
            delay={0.3}
          >
            <SparkBadge size={56} />
          </Float>
        </div>
      </div>
    </section>
  );
}
