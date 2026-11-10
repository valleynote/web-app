"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

function applyConsent(value: CookieConsent | null) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  if (value === "all") {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
}

/** Syncs cookie consent + identifies signed-in users for PostHog. */
export default function PostHogAnalytics() {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    applyConsent(readCookieConsent());

    const onConsent = (event: Event) => {
      const detail = (event as CustomEvent<{ value: CookieConsent }>).detail;
      applyConsent(detail?.value ?? readCookieConsent());
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;

    const user = session?.user;
    if (user?.id) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
      });
      return;
    }

    // Signed-out: keep anonymous id until an explicit logout reset.
  }, [session?.user]);

  return null;
}
