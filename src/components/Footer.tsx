"use client";

import Image from "next/image";
import Link from "next/link";
import { openCookiePreferences } from "@/lib/cookie-consent";

const productLinks = [
  { label: "Ask my notes", href: "/#ask" },
  { label: "Organize", href: "/#context" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Help", href: "/#faq" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const accountLinks = [
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
      <div className="relative mx-auto w-full max-w-[1140px] px-4 pt-16 sm:px-5 sm:pt-20 md:pt-24">
        <div className="relative grid gap-10 border-b border-white/10 pb-10 md:grid-cols-12 md:gap-8 md:pb-12">
          <div className="md:col-span-4 md:pr-8">
            <Link href="/" className="inline-flex max-w-full items-center">
              <Image
                src="/dashboard-logo-white-2.svg"
                alt="ValleyNote"
                width={220}
                height={52}
                className="h-9 w-auto max-w-full sm:h-11 md:h-12"
              />
            </Link>
            <p className="mt-4 max-w-[300px] text-[14px] font-medium leading-snug tracking-[-0.02em] text-[#d8cdc4] sm:text-[15px]">
              An AI notebook for students, freelancers, and founders — write once,
              ask anytime.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-white px-5 py-3 text-[15px] font-semibold tracking-[-0.02em] text-ink transition hover:bg-white/90 sm:mt-6 sm:w-auto"
            >
              Start free
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:col-span-8">
            <div>
              <h3 className="text-[15px] font-medium tracking-[-0.02em] text-white">
                Product
              </h3>
              <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                {productLinks.map((link) => (
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

            <div>
              <h3 className="text-[15px] font-medium tracking-[-0.02em] text-white">
                Company
              </h3>
              <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                {companyLinks.map((link) => (
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

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-[15px] font-medium tracking-[-0.02em] text-white">
                Account
              </h3>
              <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                {accountLinks.map((link) => (
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
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {socials.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-medium tracking-[-0.02em] text-[#a39a92] transition hover:text-white"
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
              Privacy
            </Link>
            <span className="text-white/30" aria-hidden>
              |
            </span>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <span className="text-white/30" aria-hidden>
              |
            </span>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="transition hover:text-white"
            >
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
