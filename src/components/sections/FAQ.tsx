"use client";

import Link from "next/link";
import { useState } from "react";
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
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-blue">
            Help
          </p>
          <h2 className="mt-3 font-inter-tight text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px] md:text-[44px] md:leading-[1.1]">
            Questions about your notebook
          </h2>
          <p className="mx-auto mt-3 max-w-[540px] text-[14px] font-medium leading-relaxed tracking-[-0.02em] text-muted sm:mt-4 sm:text-[16px] md:text-[17px]">
            How Ask my notes works, writing tools, privacy, pricing, and getting
            started with ValleyNote.
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

          <div className="flex flex-col gap-4 border-t border-bg-border py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 md:py-7">
            <p className="text-[14px] font-medium leading-snug tracking-[-0.02em] text-ink sm:text-[15px]">
              Still unsure?
              <span className="mt-0.5 block text-muted">
                Email us from the contact page — we reply to notebook questions.
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
              <Link
                href="/signup"
                className="rounded-md border border-solid border-bg-border bg-bg-muted px-4 py-3 text-center text-[14px] font-medium tracking-[-0.02em] text-ink transition hover:border-ink/25 hover:bg-white sm:px-[18px] sm:py-[12px]"
              >
                Sign up
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#1a1a1a] px-4 py-3 text-[14px] font-medium tracking-[-0.02em] text-white transition hover:bg-ink-soft sm:px-[18px] sm:py-[13px]"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
