import { logger } from "@/lib/logger";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM?.trim() || "ValleyNote <onboarding@resend.dev>";

  if (!apiKey) {
    logger.info({ to, subject, text, html }, "email.dev_fallback");
    return { id: "dev-fallback" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!res.ok) {
    const body = await res.text();
    let detail = body;
    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed.message) detail = parsed.message;
    } catch {
      // keep raw body
    }
    logger.error({ status: res.status, body, from, to }, "email.send_failed");
    throw new Error(detail || "Failed to send email");
  }

  return (await res.json()) as { id: string };
}

export function verificationEmailHtml(name: string, url: string) {
  const safeName = escapeHtml(name || "there");
  const safeUrl = escapeHtml(url);
  return `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a1a1a; background:#f7f5f3; padding:32px 16px;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #d6d0c8;border-radius:24px;padding:32px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#3745f1;font-weight:600;">ValleyNote</p>
        <h1 style="font-size:24px;margin:0 0 12px;letter-spacing:-0.02em;">Verify your email</h1>
        <p style="margin:0 0 16px;color:#595959;line-height:1.5;">Hi ${safeName}, confirm your email to unlock AI features in ValleyNote.</p>
        <p style="margin:0 0 24px;"><a href="${safeUrl}" style="display:inline-block;background:#3745f1;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:500;">Verify email</a></p>
        <p style="margin:0;color:#707070;font-size:13px;line-height:1.5;word-break:break-all;">Or open this link:<br/>${safeUrl}</p>
      </div>
    </div>
  `;
}

export function resetPasswordEmailHtml(url: string) {
  const safeUrl = escapeHtml(url);
  return `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a1a1a; background:#f7f5f3; padding:32px 16px;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #d6d0c8;border-radius:24px;padding:32px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#3745f1;font-weight:600;">ValleyNote</p>
        <h1 style="font-size:24px;margin:0 0 12px;letter-spacing:-0.02em;">Reset your password</h1>
        <p style="margin:0 0 16px;color:#595959;line-height:1.5;">This link expires in 1 hour and can be used once.</p>
        <p style="margin:0 0 24px;"><a href="${safeUrl}" style="display:inline-block;background:#3745f1;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:500;">Reset password</a></p>
        <p style="margin:0;color:#707070;font-size:13px;line-height:1.5;word-break:break-all;">Or open this link:<br/>${safeUrl}</p>
      </div>
    </div>
  `;
}

export function deleteAccountOtpEmailHtml(name: string, code: string) {
  const safeName = escapeHtml(name || "there");
  const safeCode = escapeHtml(code);
  return `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1a1a1a; background:#f7f5f3; padding:32px 16px;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #d6d0c8;border-radius:24px;padding:32px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#3745f1;font-weight:600;">ValleyNote</p>
        <h1 style="font-size:24px;margin:0 0 12px;letter-spacing:-0.02em;">Confirm account deletion</h1>
        <p style="margin:0 0 16px;color:#595959;line-height:1.5;">Hi ${safeName}, use this code to permanently delete your ValleyNote account. It expires in 10 minutes.</p>
        <p style="margin:0 0 8px;font-size:32px;letter-spacing:0.28em;font-weight:700;text-align:center;">${safeCode}</p>
        <p style="margin:16px 0 0;color:#707070;font-size:13px;line-height:1.5;">If you did not request this, you can ignore this email — your account stays safe.</p>
      </div>
    </div>
  `;
}
