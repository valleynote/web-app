import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { aiConfig } from "@/lib/ai/config";
import { assertAiQuota } from "@/lib/ai/quota";
import { checkRateLimit } from "@/lib/rate-limit";

type AiGuardOk = {
  ok: true;
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  quota: Extract<Awaited<ReturnType<typeof assertAiQuota>>, { ok: true }>;
};

type AiGuardErr = {
  ok: false;
  response: Response;
};

/**
 * Shared gate for /api/ai/*: session, verified email, burst limit, monthly quota.
 */
export async function requireAiAccess(): Promise<AiGuardOk | AiGuardErr> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false, response: new Response("Unauthorized", { status: 401 }) };
  }

  if (!session.user.emailVerified) {
    return {
      ok: false,
      response: Response.json(
        { error: "Verify your email before using AI features." },
        { status: 403 },
      ),
    };
  }

  const burst = checkRateLimit(`ai:${session.user.id}`, {
    limit: aiConfig.rateLimitPerMinute,
    windowMs: 60_000,
  });
  if (!burst.ok) {
    return {
      ok: false,
      response: Response.json(
        { error: "Too many AI requests. Slow down and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(burst.retryAfterSec) },
        },
      ),
    };
  }

  const quota = await assertAiQuota(session.user.id);
  if (!quota.ok) {
    return {
      ok: false,
      response: Response.json(
        {
          error: quota.message,
          upgrade: true,
          used: quota.used,
          limit: quota.limit,
        },
        { status: 402 },
      ),
    };
  }

  return { ok: true, session, quota };
}
