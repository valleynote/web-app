"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import sharp from "sharp";
import { z } from "zod";
import type { PlanId } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { dicebearAvatar } from "@/lib/avatar";
import {
  deleteAccountOtpEmailHtml,
  sendEmail,
} from "@/lib/email";
import { getPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { assertImageUpload } from "@/lib/uploads";

const profileSchema = z.object({
  name: z.string().min(1).max(80),
  image: z.string().max(400_000).nullable().optional(),
});

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  locale: z.enum(["en", "fr", "es", "de", "pt", "ja"]),
});

const planChangeSchema = z.object({
  plan: z.enum(["free", "plus", "pro", "enterprise"]),
});

const SELECTABLE_PLANS: PlanId[] = [
  "free",
  "plus",
  "pro",
  "enterprise",
];

export async function updateProfileAction(input: {
  name: string;
  image?: string | null;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid profile data" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      ...(parsed.data.image !== undefined
        ? { image: parsed.data.image }
        : {}),
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true as const };
}

export async function setPresetAvatarAction(seed: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const cleanSeed = z.string().min(1).max(64).safeParse(seed);
  if (!cleanSeed.success) {
    return { error: "Invalid avatar" };
  }

  const image = dicebearAvatar(cleanSeed.data, {
    style: "notionists-neutral",
    size: 256,
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image },
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true as const, image };
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    !!value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "size" in value &&
    typeof (value as File).arrayBuffer === "function" &&
    typeof (value as File).size === "number"
  );
}

export async function uploadAvatarAction(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { error: "Unauthorized" };
    }

    const entry = formData.get("avatar");
    if (!isUploadFile(entry) || entry.size === 0) {
      return { error: "Please choose an image" };
    }

    try {
      assertImageUpload({
        type: entry.type,
        size: entry.size,
        maxBytes: 5 * 1024 * 1024,
      });
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "File must be an image",
      };
    }

    const buffer = Buffer.from(await entry.arrayBuffer());
    const optimized = await sharp(buffer, { failOn: "warning" })
      .rotate()
      .resize(256, 256, { fit: "cover" })
      .webp({ quality: 85 })
      .toBuffer();

    const image = `data:image/webp;base64,${optimized.toString("base64")}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
    });

    revalidatePath("/app");
    revalidatePath("/app/settings");
    return { ok: true as const, image };
  } catch (err) {
    console.error("uploadAvatarAction failed:", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not upload image. Please try another file.",
    };
  }
}

export async function updatePreferencesAction(input: {
  theme: "light" | "dark" | "system";
  locale: "en" | "fr" | "es" | "de" | "pt" | "ja";
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid preferences" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      theme: parsed.data.theme,
      locale: parsed.data.locale,
    },
  });

  const cookieStore = await cookies();
  const secure =
    (process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "").startsWith(
      "https://",
    );
  cookieStore.set("vn-theme", parsed.data.theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure,
  });
  cookieStore.set("vn-locale", parsed.data.locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure,
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true as const };
}

export async function revokeSessionAction(sessionToken: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const token = z.string().min(8).safeParse(sessionToken);
  if (!token.success) {
    return { error: "Invalid session" };
  }

  if (token.data === session.session.token) {
    return { error: "You can’t revoke your current session" };
  }

  const target = await prisma.session.findUnique({
    where: { token: token.data },
  });
  if (!target || target.userId !== session.user.id) {
    return { error: "Session not found" };
  }

  await prisma.session.delete({ where: { token: token.data } });
  revalidatePath("/app/settings");
  return { ok: true as const };
}

export async function revokeOtherSessionsAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  await prisma.session.deleteMany({
    where: {
      userId: session.user.id,
      token: { not: session.session.token },
    },
  });

  revalidatePath("/app/settings");
  return { ok: true as const };
}

/** @deprecated Prefer Whop checkout + cancelSubscriptionAction. Kept for admin/internal free toggles only. */
export async function changePlanAction(input: { plan: PlanId }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const parsed = planChangeSchema.safeParse(input);
  if (!parsed.success || !SELECTABLE_PLANS.includes(parsed.data.plan)) {
    return { error: "Invalid plan" };
  }

  if (parsed.data.plan !== "free" && parsed.data.plan !== "enterprise") {
    return {
      error: "Paid plans require Whop checkout from Billing settings",
    };
  }

  const plan = getPlan(parsed.data.plan);
  const periodEnd = new Date();
  periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      plan: parsed.data.plan,
      status: "active",
      currentPeriodEnd: periodEnd,
    },
    update: {
      plan: parsed.data.plan,
      status: "active",
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      whopMembershipId: null,
      whopPlanId: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "subscription.plan_changed",
      meta: { plan: parsed.data.plan, planName: plan.name },
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
  revalidatePath("/app/plans");
  return { ok: true as const, plan: plan.name };
}

const DELETE_OTP_PREFIX = "delete-account:";
const DELETE_OTP_TTL_MS = 10 * 60 * 1000;

function hashOtp(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function deleteOtpIdentifier(userId: string) {
  return `${DELETE_OTP_PREFIX}${userId}`;
}

async function softDeleteAccount(userId: string, emailSnapshot: string) {
  const deletedAt = new Date();
  await prisma.$transaction([
    prisma.verification.deleteMany({
      where: { identifier: deleteOtpIdentifier(userId) },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt,
        // Free the unique email for future signups while keeping the row.
        email: `deleted+${userId}@deleted.valleynote.local`,
        emailVerified: false,
        name: "Deleted user",
        image: null,
      },
    }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "account.soft_deleted",
        meta: { email: emailSnapshot, deletedAt: deletedAt.toISOString() },
      },
    }),
  ]);
}

/** Email-confirm delete used by the profile danger zone. */
export async function deleteAccountAction(confirmEmail: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  if (confirmEmail.trim().toLowerCase() !== session.user.email.toLowerCase()) {
    return { error: "Type your email exactly to confirm" };
  }

  await softDeleteAccount(session.user.id, session.user.email);
  return { ok: true as const };
}

export async function requestDeleteAccountOtpAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;
  const identifier = deleteOtpIdentifier(userId);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + DELETE_OTP_TTL_MS);

  await prisma.verification.deleteMany({ where: { identifier } });
  await prisma.verification.create({
    data: {
      identifier,
      value: hashOtp(code),
      expiresAt,
    },
  });

  try {
    await sendEmail({
      to: session.user.email,
      subject: "Your ValleyNote deletion code",
      html: deleteAccountOtpEmailHtml(session.user.name, code),
      text: `Your ValleyNote account deletion code is ${code}. It expires in 10 minutes.`,
    });
  } catch (err) {
    await prisma.verification.deleteMany({ where: { identifier } });
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not send verification email",
    };
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action: "account.delete_otp_sent",
      meta: { email: session.user.email },
    },
  });

  return {
    ok: true as const,
    email: session.user.email,
    expiresInSeconds: Math.floor(DELETE_OTP_TTL_MS / 1000),
  };
}

export async function confirmDeleteAccountOtpAction(otp: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const parsed = z
    .string()
    .regex(/^\d{6}$/, "Enter the 6-digit code")
    .safeParse(otp.trim());
  if (!parsed.success) {
    return { error: "Enter the 6-digit code from your email" };
  }

  const userId = session.user.id;
  const identifier = deleteOtpIdentifier(userId);
  const record = await prisma.verification.findFirst({
    where: { identifier },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    await prisma.verification.deleteMany({ where: { identifier } });
    return { error: "Code expired. Request a new one." };
  }

  if (record.value !== hashOtp(parsed.data)) {
    return { error: "Incorrect code. Check your email and try again." };
  }

  await softDeleteAccount(userId, session.user.email);
  return { ok: true as const };
}
