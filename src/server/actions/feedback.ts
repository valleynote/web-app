"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";

const feedbackSchema = z.object({
  category: z.enum(["idea", "bug", "other"]),
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

const categoryLabel = {
  idea: "Idea",
  bug: "Bug",
  other: "Other",
} as const;

export async function submitFeedbackAction(input: {
  category: "idea" | "bug" | "other";
  message: string;
}) {
  const session = await getSession();
  if (!session?.user) {
    return { ok: false as const, error: "Please sign in to send feedback." };
  }

  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Please write a bit more detail (at least 10 characters).",
    };
  }

  const { category, message } = parsed.data;
  const limited = checkRateLimit(`feedback:${session.user.id}`, {
    limit: 8,
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

  const name = session.user.name?.trim() || "User";
  const email = session.user.email;
  const label = categoryLabel[category];
  const subject = `ValleyNote feedback — ${label} — ${name}`;
  const text = [
    `Category: ${label}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `User ID: ${session.user.id}`,
    "",
    message,
  ].join("\n");

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a1a1a; background:#f7f5f3; padding:32px 16px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #d6d0c8;border-radius:24px;padding:32px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#3745f1;font-weight:600;">ValleyNote</p>
        <h1 style="font-size:22px;margin:0 0 16px;letter-spacing:-0.02em;">New product feedback</h1>
        <p style="margin:0 0 8px;color:#595959;"><strong>Category:</strong> ${escapeHtml(label)}</p>
        <p style="margin:0 0 8px;color:#595959;"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 16px;color:#595959;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:0;color:#1a1a1a;line-height:1.55;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({ to, subject, html, text });
    return { ok: true as const };
  } catch (error) {
    logger.error({ err: error }, "feedback.submit_failed");
    return {
      ok: false as const,
      error: "Could not send feedback. Email us at hello@valleynote.com.",
    };
  }
}
