import { unwrapWebhook } from "@whop/sdk/helpers";
import type { NextRequest } from "next/server";
import {
  applyMembershipPayload,
  applyPaymentSucceeded,
} from "@/lib/billing";

export const runtime = "nodejs";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  const secret = process.env.WHOP_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("WHOP_WEBHOOK_SECRET is not configured");
    return new Response("Webhook secret missing", { status: 500 });
  }

  const payload = await request.text();
  const headers = Object.fromEntries(request.headers);

  let event: { type?: string; data?: unknown };
  try {
    event = unwrapWebhook(payload, {
      headers,
      key: secret,
    }) as { type?: string; data?: unknown };
  } catch (err) {
    console.error("Whop webhook verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    const data = asRecord(event.data) ?? {};
    switch (event.type) {
      case "payment.succeeded":
        await applyPaymentSucceeded(data);
        break;
      case "membership.activated":
      case "membership.updated":
        await applyMembershipPayload(data);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("Whop webhook handler failed", { type: event.type, err });
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
