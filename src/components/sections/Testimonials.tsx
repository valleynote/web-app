"use client";

import Image from "next/image";
import { assets } from "@/lib/assets";

const testimonials = [
  {
    quote:
      "ValleyNote transformed how I manage research notes. Ask my notes finds decisions instantly, and the writing tools save me hours every week.",
    name: "Daniel Carter",
    role: "Operations Coordinator",
    rating: 5,
  },
  {
    quote:
      "ValleyNote helps our team capture meeting notes and turn them into action items while keeping everything searchable in one calm workspace.",
    name: "Sophia Bennett",
    role: "Customer Success Lead",
    rating: 5,
  },
  {
    quote:
      "With ValleyNote handling summaries and rewrites, our writers can focus on deeper work and still find any note by meaning, not keywords.",
    name: "Michael Torres",
    role: "Product Manager",
    rating: 5,
  },
  {
    quote:
      "Voice notes, tags, and Ask my notes made ValleyNote the only notebook our remote team actually sticks with day to day.",
    name: "Emily Rodriguez",
    role: "Customer Experience Director",
    rating: 4,
  },
  {
    quote:
      "I switched from scattered docs to ValleyNote in a weekend. Semantic search alone pays for itself when digging up old project decisions.",
    name: "Ryan Mitchell",
    role: "Operations Lead",
    rating: 5,
  },
];

function QuoteMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 22" fill="none" aria-hidden>
      <path
        d="M0 22V13.2C0 9.7 0.8 6.85 2.4 4.65C4 2.45 6.35 1 9.45 0.3L11.1 4.05C9.3 4.55 7.95 5.45 7.05 6.75C6.15 8.05 5.7 9.7 5.7 11.7H11.1V22H0ZM16.5 22V13.2C16.5 9.7 17.3 6.85 18.9 4.65C20.5 2.45 22.85 1 25.95 0.3L27.6 4.05C25.8 4.55 24.45 5.45 23.55 6.75C22.65 8.05 22.2 9.7 22.2 11.7H27.6V22H16.5Z"
        fill="#1A1A1A"
      />
    </svg>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={i < count ? "#FF7A00" : "#E5E1DC"}
          aria-hidden
        >
          <path d="M12 2.6 14.9 9l6.9.6-5.2 4.5 1.6 6.7L12 17.4 5.8 20.8l1.6-6.7L2.2 9.6 9.1 9 12 2.6Z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({
  item,
  avatar,
}: {
  item: (typeof testimonials)[number];
  avatar: string;
}) {
  return (
    <blockquote className="flex h-[300px] w-[min(300px,82vw)] shrink-0 flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_6px_13px_rgba(166,166,166,0.1),0_24px_24px_rgba(166,166,166,0.09),0_54px_32px_rgba(166,166,166,0.05),0_96px_38px_rgba(166,166,166,0.01)] sm:h-[329px] sm:w-[362px]">
      <div className="flex flex-1 flex-col gap-4 px-5 pb-0 pt-5 sm:gap-5 sm:px-6 sm:pt-6">
        <QuoteMark />
        <div className="flex flex-1 flex-col gap-4 sm:gap-5">
          <p className="line-clamp-6 font-inter-tight text-[14px] font-medium leading-[1.55] tracking-[-0.02em] text-muted sm:line-clamp-none sm:text-[17px]">
            {item.quote}
          </p>
          <Stars count={item.rating} />
        </div>
      </div>
      <div className="mt-auto h-px w-full bg-bg-line" />
      <footer className="flex items-center gap-3 px-6 py-5">
        <Image
          src={avatar}
          alt=""
          width={50}
          height={50}
          className="h-[50px] w-[50px] shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 text-left">
          <cite className="block truncate not-italic font-inter-tight text-[15px] font-semibold tracking-[-0.02em] text-ink">
            {item.name}
          </cite>
          <p className="truncate text-[13px] font-medium tracking-[-0.02em] text-muted">
            {item.role}
          </p>
        </div>
      </footer>
    </blockquote>
  );
}

function FrameOverlay({
  src,
  className,
  width,
  height,
  priority = false,
}: {
  src: string;
  className: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  return (
    <div className={`pointer-events-none absolute top-px z-[3] h-[367px] ${className}`}>
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        className="h-full w-full object-cover object-center"
        sizes={`${width}px`}
        priority={priority}
      />
    </div>
  );
}

export default function Testimonials() {
  const loop = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="scroll-mt-28 overflow-x-clip font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[940px] text-center">
          <p className="text-[13px] font-medium uppercase text-blue sm:text-[14px]">Testimonial</p>
          <h2 className="mt-3 font-switzer text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink-soft sm:text-[36px] md:text-[44px] md:leading-[1.1] md:tracking-[-0.02em]">
            What Our Users say
          </h2>
          <p className="mx-auto mt-3 max-w-[540px] text-[14px] font-medium leading-relaxed tracking-[-0.02em] text-muted sm:mt-4 sm:text-[16px] md:text-[17px]">
            Real stories from people who write, search, and think with
            ValleyNote every day.
          </p>
        </div>
      </div>

      {/* Full-bleed oval stage */}
      <div className="relative mt-8 w-full overflow-x-clip border-y border-dashed border-bg-border sm:mt-10 md:mt-14">
        <div className="relative mx-auto h-[340px] w-full max-w-[1140px] border-x border-bg-border bg-bg-soft sm:h-[369px]">
          {/* Purple edge glows — under cards */}
          <div className="pointer-events-none absolute top-px left-[-100px] z-0 hidden h-[367px] w-[479px] sm:block">
            <Image
              src={assets.blogAlt[1]}
              alt=""
              width={952}
              height={730}
              className="h-full w-full object-cover object-center"
              sizes="479px"
            />
          </div>
          <div
            className="pointer-events-none absolute top-px right-[-100px] z-0 hidden h-[367px] w-[479px] sm:block"
            style={{ transform: "rotateY(180deg)" }}
          >
            <Image
              src={assets.blogAlt[1]}
              alt=""
              width={952}
              height={730}
              className="h-full w-full object-cover object-center"
              sizes="479px"
            />
          </div>

          {/* Marquee track — above glows */}
          <div className="absolute inset-0 z-[1] flex items-center overflow-hidden py-5">
            <div className="testimonials-marquee flex w-max items-center gap-5 will-change-transform">
              {loop.map((item, index) => (
                <TestimonialCard
                  key={`${item.name}-${index}`}
                  item={item}
                  avatar={assets.avatars[index % assets.avatars.length]}
                />
              ))}
            </div>
          </div>

          {/* Chrome oval frames — above cards */}
          <FrameOverlay
            src={assets.blogBanner}
            className="left-[-139px] hidden w-[544px] sm:block"
            width={1082}
            height={730}
          />
          <FrameOverlay
            src={assets.blogAlt[0]}
            className="right-[-139px] hidden w-[578px] sm:block"
            width={1150}
            height={730}
          />
        </div>
      </div>
    </section>
  );
}
