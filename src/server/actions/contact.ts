"use server";

import { createHash } from "node:crypto";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(5000),
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function submitContactAction(input: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Please check your details and try again." };
  }

  const { firstName, lastName, email, message } = parsed.data;
  const emailKey = createHash("sha256").update(email.toLowerCase()).digest("hex");
  const limited = checkRateLimit(`contact:${emailKey}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return {
      ok: false as const,
      error: "Too many messages. Please try again later.",
    };
  }
  const to =
    process.env.CONTACT_TO?.trim() ||
    process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] ||
    "hello@valleynote.com";

  const subject = `ValleyNote contact — ${firstName} ${lastName}`;
  const text = [
    `Name: ${firstName} ${lastName}`,
    `Email: ${email}`,
    "",
    message,
  ].join("\n");

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a1a1a; background:#f7f5f3; padding:32px 16px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #d6d0c8;border-radius:24px;padding:32px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#3745f1;font-weight:600;">ValleyNote</p>
        <h1 style="font-size:22px;margin:0 0 16px;letter-spacing:-0.02em;">New contact message</h1>
        <p style="margin:0 0 8px;color:#595959;"><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
        <p style="margin:0 0 16px;color:#595959;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:0;color:#1a1a1a;line-height:1.55;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({ to, subject, html, text });
    return { ok: true as const };
  } catch (error) {
    logger.error({ err: error }, "contact.submit_failed");
    return {
      ok: false as const,
      error: "Could not send your message. Email us at hello@valleynote.com.",
    };
  }
}
