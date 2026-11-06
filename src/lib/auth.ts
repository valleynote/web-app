import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import {
  resetPasswordEmailHtml,
  sendEmail,
  verificationEmailHtml,
} from "@/lib/email";

const appUrl =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

const authSecret = process.env.BETTER_AUTH_SECRET;
// Skip during `next build` (NODE_ENV=production there too).
const isProdRuntime =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build";
if (isProdRuntime) {
  if (!authSecret || authSecret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be set to a random string of at least 32 characters in production",
    );
  }
  if (!appUrl.startsWith("https://")) {
    throw new Error(
      "BETTER_AUTH_URL / NEXT_PUBLIC_APP_URL must be an https:// origin in production",
    );
  }
}

const trustedOrigins = [
  appUrl,
  process.env.NEXT_PUBLIC_APP_URL,
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? []),
]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  appName: "ValleyNote",
  baseURL: appUrl,
  secret: authSecret,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    useSecureCookies: appUrl.startsWith("https://"),
    defaultCookieAttributes: {
      sameSite: "lax",
      httpOnly: true,
      secure: appUrl.startsWith("https://"),
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your ValleyNote password",
        html: resetPasswordEmailHtml(url),
        text: `Reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your ValleyNote email",
        html: verificationEmailHtml(user.name, url),
        text: `Verify your email: ${url}`,
      });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      theme: {
        type: "string",
        required: false,
        defaultValue: "system",
        input: true,
      },
      locale: {
        type: "string",
        required: false,
        defaultValue: "en",
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    // Tighter in production to slow credential stuffing / reset spam.
    max: process.env.NODE_ENV === "production" ? 40 : 100,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              plan: "free",
              status: "active",
            },
          });

          const notebook = await prisma.notebook.create({
            data: {
              userId: user.id,
              name: "Getting started",
              icon: "✨",
              color: "#3745f1",
              position: 0,
            },
          });

          const samples = [
            {
              title: "Welcome to ValleyNote",
              contentText:
                "ValleyNote is your AI-powered notebook. Write freely, then ask your notes anything.",
              contentJson: {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "ValleyNote is your AI-powered notebook. Write freely, then ask your notes anything.",
                      },
                    ],
                  },
                ],
              },
            },
            {
              title: "How to use Ask my notes",
              contentText:
                "Open Ask my notes from the sidebar, ask a question, and ValleyNote answers from your writing with sources.",
              contentJson: {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Open Ask my notes from the sidebar, ask a question, and ValleyNote answers from your writing with sources.",
                      },
                    ],
                  },
                ],
              },
            },
          ] as const;

          for (const sample of samples) {
            await prisma.note.create({
              data: {
                userId: user.id,
                notebookId: notebook.id,
                title: sample.title,
                contentText: sample.contentText,
                contentJson: sample.contentJson,
                wordCount: sample.contentText.split(/\s+/).length,
              },
            });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
