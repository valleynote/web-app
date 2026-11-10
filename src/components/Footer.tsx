"use client";

import Image from "next/image";
import Link from "next/link";
import { assets } from "@/lib/assets";
import { openCookiePreferences } from "@/lib/cookie-consent";

const homeLinks = [
  { label: "Features", href: "/#features" },
  { label: "Ask AI", href: "/#ask" },
  { label: "Organize", href: "/#context" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
];

const pageLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Log in", href: "/login" },
  { label: "Sign up", href: "/signup" },
];

const socials = [
  { label: "Facebook", href: "https://www.facebook.com/people/Valleynote-App/61596063341065/" },
  { label: "Instagram", href: "https://www.instagram.com/valleynote/" },
  { label: "X/Twitter", href: "https://x.com/Valley_note" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#1a1a1a] font-inter-tight text-white">
      <Image
        src={assets.footerLine}
        alt=""
        width={1440}
        height={30}
        className="pointer-events-none absolute left-0 top-0 z-20 h-[10px] w-full object-cover md:h-[14px]"
        sizes="100vw"
      />

      <div className="relative mx-auto w-full max-w-[1140px] overflow-hidden px-4 pt-20 sm:px-5 sm:pt-24 md:overflow-visible md:pt-28">
        <Image
          src={assets.paperclipLeft}
          alt=""
          width={77}
          height={105}
          className="pointer-events-none absolute -top-5 left-1 z-30 h-auto w-[40px] -rotate-[22deg] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] sm:left-0 sm:w-[64px] md:-top-6 md:w-[77px]"
        />
        <Image
          src={assets.paperclipRight}
          alt=""
          width={77}
          height={105}
          className="pointer-events-none absolute -top-5 right-1 z-30 h-auto w-[40px] rotate-[22deg] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] sm:right-0 sm:w-[64px] md:-top-6 md:w-[77px]"
        />

        <div className="relative grid gap-10 border-b border-white/10 pb-10 md:grid-cols-12 md:gap-0 md:pb-12">
          <div className="md:col-span-4 md:pr-10">
            <Link href="/" className="inline-flex max-w-full items-center">
              <Image
                src="/dashboard-logo-white-2.svg"
                alt="ValleyNote"
                width={220}
                height={52}
                className="h-9 w-auto max-w-full sm:h-11 md:h-12"
              />
            </Link>
            <p className="mt-4 max-w-[280px] text-[14px] font-medium leading-snug tracking-[-0.02em] text-[#d8cdc4] sm:text-[15px]">
              AI-powered notebook for your notes.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white px-5 py-3 text-[15px] font-semibold tracking-[-0.02em] text-ink transition hover:bg-white/90 sm:mt-6 sm:w-auto"
            >
              Get Started
              <span aria-hidden className="text-[16px] leading-none">
                ›
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:col-span-8 md:gap-0">
            <div className="md:border-l md:border-dashed md:border-white/15 md:px-8 lg:px-10">
              <h3 className="text-[15px] font-medium tracking-[-0.02em] text-white">
                Home
              </h3>
              <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                {homeLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] font-medium tracking-[-0.02em] text-[#a39a92] transition hover:text-white sm:text-[14px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:border-l md:border-dashed md:border-white/15 md:px-8 lg:px-10">
              <h3 className="text-[15px] font-medium tracking-[-0.02em] text-white">
                All Pages
              </h3>
              <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                {pageLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] font-medium tracking-[-0.02em] text-[#a39a92] transition hover:text-white sm:text-[14px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1 md:border-l md:border-dashed md:border-white/15 md:px-8 lg:px-10">
              <h3 className="text-[15px] font-medium tracking-[-0.02em] text-white">
                Our Socials
              </h3>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 sm:mt-5 sm:block sm:space-y-3.5 sm:gap-0">
                {socials.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-medium tracking-[-0.02em] text-[#a39a92] transition hover:text-white sm:text-[14px]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:py-6 sm:text-left">
          <p className="text-[12px] font-medium tracking-[-0.02em] text-[#d8cdc4] sm:text-[13px]">
            © {new Date().getFullYear()} Moonlight Valley LLC
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[12px] font-medium tracking-[-0.02em] text-[#d8cdc4] sm:justify-end sm:text-[13px]">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <span className="text-white/30" aria-hidden>
              |
            </span>
            <Link href="/terms" className="transition hover:text-white">
              Terms of Service
            </Link>
            <span className="text-white/30" aria-hidden>
              |
            </span>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="transition hover:text-white"
            >
              Cookie settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
