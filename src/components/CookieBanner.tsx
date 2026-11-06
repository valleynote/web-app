"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_OPEN_EVENT,
  type CookieConsent,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/cookie-consent";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setVisible(readCookieConsent() === null);
    setReady(true);

    const onOpen = () => setVisible(true);
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
  }, []);

  function choose(value: CookieConsent) {
    writeCookieConsent(value);
    setVisible(false);
  }

  if (!ready) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 py-3 sm:px-6 sm:py-5 md:px-[150px] md:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: easeOut }}
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-desc"
        >
          <motion.div
            className="pointer-events-auto w-full max-w-[1140px] overflow-hidden rounded-[22px] border border-white/15 bg-blue shadow-[0_24px_64px_rgba(55,69,241,0.35)]"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <div className="relative px-5 pb-5 pt-5 sm:px-6 sm:pb-5 sm:pt-5 md:px-8">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
                aria-hidden
              />
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8 md:gap-10">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
                      aria-hidden
                    >
                      <CookieIcon />
                    </span>
                    <h2
                      id="cookie-banner-title"
                      className="font-inter-tight text-[16px] font-semibold tracking-[-0.02em] text-white sm:text-[17px]"
                    >
                      We use cookies
                    </h2>
                  </div>
                  <p
                    id="cookie-banner-desc"
                    className="mt-2.5 max-w-[62ch] text-[13px] font-medium leading-relaxed tracking-[-0.015em] text-white/80 sm:text-[14px]"
                  >
                    Essential cookies keep you signed in and remember your
                    preferences. Optional cookies help us understand how
                    ValleyNote is used so we can improve it.{" "}
                    <Link
                      href="/privacy"
                      className="text-white underline decoration-white/40 underline-offset-[3px] transition hover:decoration-white"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => choose("essential")}
                    className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/25 bg-transparent px-5 font-inter-tight text-[14px] font-semibold tracking-[-0.02em] text-white transition hover:border-white/45 hover:bg-white/10 sm:w-auto sm:min-w-[148px]"
                  >
                    Essential only
                  </button>
                  <button
                    type="button"
                    onClick={() => choose("all")}
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-5 font-inter-tight text-[14px] font-semibold tracking-[-0.02em] text-blue transition hover:bg-white/90 sm:w-auto sm:min-w-[132px]"
                  >
                    Accept all
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CookieIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21.5c5.1 0 9.25-4.15 9.25-9.25 0-.42-.03-.83-.1-1.23-.7.35-1.5.55-2.35.55-2.76 0-5-2.24-5-5 0-.85.2-1.65.55-2.35-.4-.07-.81-.1-1.23-.1C7.02 4.12 2.87 8.27 2.87 13.37S7.02 21.5 12 21.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="9.2" cy="12.2" r="1" fill="currentColor" />
      <circle cx="13.4" cy="15.1" r="1" fill="currentColor" />
      <circle cx="14.8" cy="10.6" r="1" fill="currentColor" />
    </svg>
  );
}
