"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { assets } from "@/lib/assets";
import { IconPlus } from "@/components/Icons";

const chips = [
  { label: "Make a to-do list", prompt: "Turn my notes into a clear to-do list" },
  { label: "Meeting notes", prompt: "Capture action items from my meeting notes" },
  { label: "Study notes", prompt: "Turn these notes into a study guide" },
  { label: "Summarize", prompt: "Summarize my research notes" },
  { label: "Rewrite", prompt: "Rewrite this note to be clearer and tighter" },
  { label: "Find a note", prompt: "Find the note where I wrote about…" },
  { label: "Ask my notes", prompt: "What did we decide in last week's meeting?" },
  { label: "Auto-tag", prompt: "Suggest tags for this notebook" },
];

const rotatingPrompts = [
  "Ask your notes anything…",
  "What did we decide in last week's meeting?",
  "Summarize my research notes",
  "Turn this into action items…",
  "Rewrite this draft more clearly",
  "Find notes about the product launch",
];

function IconArrowRight({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const easeOut = [0.22, 1, 0.36, 1] as const;

function HeroBadge({
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
      className="relative flex items-center justify-center rounded-full shadow-[0_12px_28px_rgba(26,26,26,0.22)]"
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
    <HeroBadge size={size} gradient={["#ffffff", "#f0ebe4"]}>
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none">
        <path
          d="M7 3.5h9.5A2.5 2.5 0 0 1 19 6v12a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Z"
          stroke="#1a1a1a"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M8.5 3.5v17" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M11.5 8h4.5M11.5 12h4.5M11.5 16h3" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </HeroBadge>
  );
}

function SparkBadge({ size = 56 }: { size?: number }) {
  const icon = Math.round(size * 0.58);
  return (
    <HeroBadge size={size} gradient={["#8dff5c", "#62ff2e"]}>
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
    </HeroBadge>
  );
}

function Float({
  children,
  className,
  y = 12,
  duration = 4.8,
  delay = 0,
  rotate = 0,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  delay?: number;
  rotate?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: easeOut }}
    >
      <motion.div
        animate={{
          y: [0, -y, 0],
          rotate: rotate ? [0, rotate, 0, -rotate * 0.65, 0] : 0,
        }}
        transition={{
          y: { duration, repeat: Infinity, ease: "easeInOut" },
          rotate: rotate
            ? { duration: duration * 1.3, repeat: Infinity, ease: "easeInOut" }
            : undefined,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const router = useRouter();
  const [promptIndex, setPromptIndex] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => {
      setPromptIndex((i) => (i + 1) % rotatingPrompts.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  function goSignup(prompt?: string) {
    const q = (prompt ?? query).trim();
    router.push(q ? `/signup?intent=${encodeURIComponent(q)}` : "/signup");
  }

  return (
    <section className="relative overflow-x-clip pt-3 sm:pt-5 md:pt-6">
      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="relative mx-auto w-full max-w-[1140px]">
          <motion.div
            className="relative z-[1] overflow-hidden rounded-[24px] border border-white/20 sm:rounded-[28px] md:rounded-[40px]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
          >
            <Image
              src={assets.heroBg}
              alt=""
              fill
              className="pointer-events-none object-cover object-center"
              priority
              quality={75}
              sizes="(max-width: 768px) 100vw, 1140px"
            />

            <div className="relative z-10 flex flex-col items-center px-4 pb-7 pt-10 text-center sm:px-5 sm:pb-8 sm:pt-12 md:min-h-[704px] md:px-10 md:pb-10 md:pt-[72px]">
              <motion.a
                href="/signup"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15, ease: easeOut }}
                className="mb-4 inline-flex max-w-full items-center gap-2 rounded-md border border-white/25 bg-black/25 px-3 py-1.5 backdrop-blur-[2px] sm:mb-5"
              >
                <span className="truncate font-inter-tight text-[13px] font-medium text-white sm:text-[14px]">
                  Notebook with grounded AI
                </span>
              </motion.a>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.25, ease: easeOut }}
                className="max-w-[18ch] font-switzer text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:max-w-none sm:text-[44px] sm:leading-[1.1] md:text-[54px] md:leading-[59.4px] md:tracking-[-1.08px]"
              >
                Write, summarize, and ask
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                grounded in your notes
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: easeOut }}
                className="mt-3 max-w-[691px] font-inter-tight text-[14px] font-medium leading-[1.55] tracking-[-0.02em] text-[#d6d0c8] sm:mt-4 sm:text-[15px] md:mt-5 md:text-[17px]"
              >
                ValleyNote is the AI notebook for students, freelancers, and founders.
                <br className="hidden md:block" />{" "}
                Capture ideas, organize with tags, and get answers from what you wrote.
              </motion.p>

              <motion.form
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.45, ease: easeOut }}
                className="mt-6 w-full max-w-[691px] rounded-[18px] border border-white/30 bg-black/10 p-3.5 text-left backdrop-blur-[2px] sm:mt-8 sm:rounded-[20px] sm:bg-transparent sm:p-4 sm:backdrop-blur-none md:mt-10 md:min-h-[150px] md:p-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  goSignup();
                }}
              >
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent font-inter-tight text-[15px] font-medium tracking-[-0.02em] text-[#eeeae6] outline-none placeholder:text-[#eeeae6]/70 md:text-[16px]"
                  placeholder={rotatingPrompts[promptIndex]}
                  aria-label="Ask ValleyNote"
                />
                <div className="mt-8 flex items-center justify-between sm:mt-10 md:mt-14">
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="flex h-9 w-9 items-center justify-center transition hover:scale-105"
                    aria-label="Clear"
                  >
                    <Image
                      src={assets.icons.plus}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9"
                    />
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1a1a1a]"
                    aria-label="Get started"
                  >
                    <IconArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-5 flex w-full max-w-[720px] flex-wrap items-center justify-center gap-2 sm:mt-6 md:mt-8"
              >
                {chips.slice(0, 6).map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      setQuery(chip.prompt);
                      goSignup(chip.prompt);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white/95 px-3 py-[6px] font-inter-tight text-[13px] font-medium text-[#1a1a1a] shadow-sm transition hover:bg-[#62ff2e] sm:px-3.5 sm:text-[14px]"
                  >
                    <IconPlus size={12} className="text-[#1a1a1a]" />
                    {chip.label}
                  </button>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <Float
            className="pointer-events-none absolute left-[-18px] top-[42%] z-20 hidden md:block"
            y={14}
            duration={4.6}
            delay={0.65}
          >
            <NotebookBadge size={68} />
          </Float>

          <Float
            className="pointer-events-none absolute right-[-14px] top-[28%] z-20 hidden md:block"
            y={12}
            duration={5}
            delay={0.7}
          >
            <SparkBadge size={56} />
          </Float>

          <Float
            className="pointer-events-none absolute -left-[70px] bottom-[-12px] z-20 hidden md:block lg:-left-[90px]"
            y={15}
            duration={5.8}
            delay={0.8}
            rotate={2.2}
          >
            <Image
              src={assets.stickyNoteCard}
              alt=""
              width={160}
              height={155}
              className="h-auto w-[140px] drop-shadow-xl lg:w-[160px]"
            />
          </Float>
        </div>
      </div>
    </section>
  );
}
