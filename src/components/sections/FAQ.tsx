"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { assets } from "@/lib/assets";
import { IconChevron } from "@/components/Icons";

const faqs = [
  {
    question: "What is ValleyNote?",
    answer:
      "ValleyNote is an AI notebook for capturing ideas, writing with inline AI, searching by meaning, and asking questions across your notes, all in one calm workspace.",
  },
  {
    question: "How does Ask my notes work?",
    answer:
      "Ask my notes answers from your notebooks and links back to the exact notes it used, so every reply is grounded in your own writing, not the open web.",
  },
  {
    question: "Which AI writing features are included?",
    answer:
      "Rewrite, summarize, continue writing, fix grammar, change tone, auto-title, auto-tag, and pull to-dos from meetings, without leaving the editor.",
  },
  {
    question: "Can I search across all my notebooks?",
    answer:
      "Yes. Semantic search finds ideas by meaning, not just keywords, so you can dig up that meeting decision or research note even when you forget the exact words.",
  },
  {
    question: "Does ValleyNote support voice notes and media?",
    answer:
      "Yes. Capture voice notes and turn speech into text, embed images and video, and keep everything organized with tags and notebooks.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Your notes stay in your ValleyNote account. We do not sell your content or use private notes to train public AI models.",
  },
  {
    question: "How quickly can I get started?",
    answer:
      "Create a free account and write your first note in under a minute. Upgrade anytime for more AI actions, voice notes, Ask my notes, and storage.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-28 font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[1140px]">
        <div className="mx-auto max-w-[720px] text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-blue">
            FAQ&apos;s
          </p>
          <h2 className="mt-3 font-inter-tight text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px] md:text-[44px] md:leading-[1.1]">
            Common Questions Answered
          </h2>
          <p className="mx-auto mt-3 max-w-[540px] text-[14px] font-medium leading-relaxed tracking-[-0.02em] text-muted sm:mt-4 sm:text-[16px] md:text-[17px]">
            Find answers about ValleyNote features, Ask my notes, AI writing,
            privacy, pricing, and how to get started
          </p>
        </div>

        <div className="mt-8 sm:mt-12 md:mt-14">
          <ul>
            {faqs.map((item, index) => {
              const open = openIndex === index;
              const isLast = index === faqs.length - 1;
              return (
                <li
                  key={item.question}
                  className={isLast ? undefined : "border-b border-bg-border"}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full items-start justify-between gap-4 py-4 text-left sm:items-center sm:gap-6 sm:py-5 md:gap-10 md:py-6"
                    aria-expanded={open}
                  >
                    <span className="font-switzer text-[16px] font-semibold leading-snug tracking-[-0.02em] text-ink-soft sm:text-[17px] md:text-[18px]">
                      {item.question}
                    </span>
                    <IconChevron
                      size={18}
                      className={`mt-1 shrink-0 text-blue transition-transform duration-300 ease-out sm:mt-0 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-4 pr-6 text-[14px] font-medium leading-relaxed tracking-[-0.02em] text-muted sm:pb-5 sm:pr-10 sm:text-[15px] md:pb-6 md:pr-16 md:text-[16px] md:leading-6">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 md:py-7">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex shrink-0 -space-x-3">
                {assets.people.map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt=""
                    width={48}
                    height={48}
                    className="h-10 w-10 rounded-full border-2 border-bg object-cover sm:h-12 sm:w-12"
                  />
                ))}
              </div>
              <p className="text-[13px] font-medium leading-[1.35] tracking-[-0.02em] text-ink sm:text-[14px] md:text-[15px]">
                Talk to our team anytime
                <span className="mt-0.5 block text-muted">
                  Just send us a message
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-wrap sm:items-center">
              <Link
                href="/signup"
                className="rounded-full border border-solid border-bg-border bg-bg-muted px-4 py-3 text-center text-[14px] font-medium tracking-[-0.02em] text-ink transition hover:border-ink/25 hover:bg-white sm:px-[18px] sm:py-[12px]"
              >
                Sign up
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1a1a1a] px-4 py-3 text-[14px] font-medium tracking-[-0.02em] text-white transition hover:bg-ink-soft sm:px-[18px] sm:py-[13px]"
              >
                Contact us
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
        </div>
      </div>
    </section>
  );
}
