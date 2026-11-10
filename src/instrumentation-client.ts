import posthog from "posthog-js";
import { readCookieConsent } from "@/lib/cookie-consent";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

if (token) {
  posthog.init(token, {
    api_host: host,
    defaults: "2026-08-30",
    // Notes can appear on screen — never record sessions.
    disable_session_recording: true,
    // Honor ValleyNote cookie banner (optional analytics only).
    opt_out_capturing_by_default: readCookieConsent() !== "all",
  });
}
