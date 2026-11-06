"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconClose, IconMenu } from "@/components/Icons";

function ChevronRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
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

const nav = [
  { label: "Features", href: "/#features" },
  { label: "Ask AI", href: "/#ask" },
  { label: "Organize", href: "/#context" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("/#features");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = nav.map((item) => item.href.split("#")[1]).filter(Boolean);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActive(`/#${visible.target.id}`);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 font-inter-tight transition-[padding,background-color] duration-300 ease-out ${
        scrolled
          ? "bg-transparent px-3 pt-2.5 sm:px-5 sm:pt-4"
          : "bg-bg/95 px-0 pt-0 backdrop-blur-md"
      }`}
    >
      <div
        className={`relative mx-auto w-full transition-all duration-300 ease-out ${
          scrolled
            ? "max-w-[920px] rounded-[22px] border border-bg-border/80 bg-white/90 px-3 shadow-[0_8px_28px_rgba(26,26,26,0.06)] backdrop-blur-md sm:rounded-full sm:px-4 md:px-5"
            : "max-w-[1440px] rounded-none border border-transparent bg-transparent px-4 shadow-none sm:px-6 md:px-[150px]"
        }`}
      >
        <div
          className={`mx-auto flex w-full items-center justify-between gap-3 transition-all duration-300 ease-out ${
            scrolled
              ? "h-[52px] max-w-none sm:h-[64px]"
              : "h-[64px] max-w-[1140px] sm:h-[76px] md:h-[87px]"
          }`}
        >
          <Link href="/" className="relative z-10 min-w-0 shrink">
            <Image
              src="/logo-dashboard.svg"
              alt="ValleyNote"
              width={152}
              height={36}
              className={`w-auto max-w-[132px] transition-[height] duration-300 sm:max-w-none ${
                scrolled ? "h-[26px] sm:h-[30px]" : "h-[28px] sm:h-[32px]"
              }`}
              priority
            />
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative font-medium tracking-[-0.02em] transition ${
                  scrolled
                    ? `rounded-full px-2.5 py-1.5 text-[13px] ${
                        active === item.href
                          ? "text-ink"
                          : "text-muted hover:text-ink"
                      }`
                    : `px-2.5 py-2 text-[15px] ${
                        active === item.href
                          ? "text-blue after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-[2px] after:rounded-full after:bg-blue"
                          : "text-ink hover:text-blue"
                      }`
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div
            className={`hidden items-center lg:flex ${scrolled ? "gap-1.5" : "gap-2"}`}
          >
            <Link
              href="/login"
              className={`font-medium tracking-[-0.02em] transition ${
                scrolled
                  ? "rounded-full px-3 py-2 text-[13px] text-ink hover:text-ink-soft"
                  : "rounded-full border border-solid border-bg-border bg-bg-muted px-[18px] py-[12px] text-[14px] text-ink hover:border-ink/25 hover:bg-white"
              }`}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={`inline-flex items-center justify-center rounded-full bg-[#1a1a1a] font-medium tracking-[-0.02em] text-white transition hover:bg-ink-soft ${
                scrolled
                  ? "px-4 py-2 text-[13px]"
                  : "gap-1.5 px-[18px] py-[13px] text-[14px]"
              }`}
            >
              {scrolled ? "Get started" : "Get started free"}
              {!scrolled ? <ChevronRightIcon size={14} /> : null}
            </Link>
          </div>

          <button
            type="button"
            className={`relative z-10 flex shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-white lg:hidden ${
              scrolled ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10 sm:h-11 sm:w-11"
            }`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <IconClose size={scrolled ? 16 : 18} />
            ) : (
              <IconMenu size={scrolled ? 16 : 18} />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div
            className={
              scrolled
                ? "absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[min(70vh,520px)] overflow-y-auto rounded-[20px] border border-bg-border/80 bg-white/95 p-3 shadow-[0_12px_36px_rgba(26,26,26,0.1)] backdrop-blur-md lg:hidden"
                : "border-t border-bg-line bg-bg px-1 py-3 sm:px-2 lg:hidden"
            }
          >
            <div className="flex flex-col gap-0.5">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-[15px] font-medium tracking-[-0.02em] text-ink hover:bg-bg-muted sm:py-2.5 sm:text-[14px]"
                >
                  {item.label}
                </Link>
              ))}
              <div
                className={`grid grid-cols-2 gap-2 ${
                  scrolled
                    ? "mt-2 border-t border-bg-line pt-3"
                    : "mt-3"
                }`}
              >
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-bg-border bg-bg-muted px-4 py-3 text-center text-[14px] font-medium tracking-[-0.02em] transition hover:bg-white sm:py-2.5 sm:text-[13px]"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-[#1a1a1a] px-4 py-3 text-center text-[14px] font-medium tracking-[-0.02em] text-white sm:py-2.5 sm:text-[13px]"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
