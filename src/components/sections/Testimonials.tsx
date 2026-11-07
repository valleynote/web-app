"use client";

import Image from "next/image";
import { assets } from "@/lib/assets";

const testimonials = [
  {
    quote:
      "I finally stopped losing meeting decisions in scattered docs. Asking ValleyNote ‘what did we ship last sprint?’ saves me from digging through notebooks.",
    name: "Amina Okonkwo",
    role: "Graduate researcher",
  },
  {
    quote:
      "As a freelance writer, rewrite and summarize inside the note is the killer feature. My drafts stay one place and still feel easy to search later.",
    name: "Noah Ellery",
    role: "Freelance writer",
  },
  {
    quote:
      "Voice notes from campus walks turn into tagged study guides overnight. It’s the first notebook my study group actually keeps using.",
    name: "Priya Natarajan",
    role: "Medical student",
  },
  {
    quote:
      "Founders live in meetings. ValleyNote turns those transcripts into action items I can ask about weeks later without opening ten tabs.",
    name: "Jordan Hale",
    role: "Startup founder",
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="#FF7A00"
          aria-hidden
        >
          <path d="M12 2.6 14.9 9l6.9.6-5.2 4.5 1.6 6.7L12 17.4 5.8 20.8l1.6-6.7L2.2 9.6 9.1 9 12 2.6Z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-28 font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[1140px]">
          <div className="mx-auto max-w-[640px] text-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.04em] text-blue sm:text-[14px]">
              From real notebooks
            </p>
            <h2 className="mt-3 font-switzer text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink-soft sm:text-[36px] md:text-[44px] md:leading-[1.1]">
              Built for people who write a lot
            </h2>
            <p className="mt-3 font-inter-tight text-[14px] font-medium leading-relaxed text-muted sm:text-[15px]">
              Students, freelancers, and founders use ValleyNote to capture ideas
              and get answers from their own writing.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {testimonials.map((item, index) => (
              <blockquote
                key={item.name}
                className="flex h-full flex-col rounded-[18px] border border-bg-border bg-white p-5 shadow-[0_12px_32px_rgba(26,26,26,0.04)]"
              >
                <Stars />
                <p className="mt-4 flex-1 font-inter-tight text-[14px] font-medium leading-[1.55] tracking-[-0.02em] text-muted sm:text-[15px]">
                  {item.quote}
                </p>
                <footer className="mt-5 flex items-center gap-3 border-t border-bg-line pt-4">
                  <Image
                    src={assets.avatars[index % assets.avatars.length]}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 text-left">
                    <cite className="block truncate not-italic font-inter-tight text-[14px] font-semibold tracking-[-0.02em] text-ink">
                      {item.name}
                    </cite>
                    <p className="truncate text-[12px] font-medium tracking-[-0.02em] text-muted">
                      {item.role}
                    </p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
