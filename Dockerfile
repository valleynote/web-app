# Production image for ValleyNote (built on VPS or CI)
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

FROM deps AS migrate
WORKDIR /app
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_APP_URL=https://valleynote.com
ARG NEXT_PUBLIC_WHOP_PLAN_BASIC_MONTHLY
ARG NEXT_PUBLIC_WHOP_PLAN_BASIC_YEARLY
ARG NEXT_PUBLIC_WHOP_PLAN_PLUS_MONTHLY
ARG NEXT_PUBLIC_WHOP_PLAN_PLUS_YEARLY
ARG NEXT_PUBLIC_WHOP_PLAN_PRO_MONTHLY
ARG NEXT_PUBLIC_WHOP_PLAN_PRO_YEARLY
ARG NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
ARG NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_WHOP_PLAN_BASIC_MONTHLY=$NEXT_PUBLIC_WHOP_PLAN_BASIC_MONTHLY
ENV NEXT_PUBLIC_WHOP_PLAN_BASIC_YEARLY=$NEXT_PUBLIC_WHOP_PLAN_BASIC_YEARLY
ENV NEXT_PUBLIC_WHOP_PLAN_PLUS_MONTHLY=$NEXT_PUBLIC_WHOP_PLAN_PLUS_MONTHLY
ENV NEXT_PUBLIC_WHOP_PLAN_PLUS_YEARLY=$NEXT_PUBLIC_WHOP_PLAN_PLUS_YEARLY
ENV NEXT_PUBLIC_WHOP_PLAN_PRO_MONTHLY=$NEXT_PUBLIC_WHOP_PLAN_PRO_MONTHLY
ENV NEXT_PUBLIC_WHOP_PLAN_PRO_YEARLY=$NEXT_PUBLIC_WHOP_PLAN_PRO_YEARLY
ENV NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=$NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST
# Dummy values so Next can collect page data at build time (runtime uses real env)
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public"
ENV BETTER_AUTH_SECRET="build-time-secret-not-used-at-runtime-32chars"
ENV BETTER_AUTH_URL="https://valleynote.com"
ENV REDIS_URL="redis://127.0.0.1:6379"
RUN npx prisma generate && npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nextjs \
  && apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/src/generated ./src/generated
RUN mkdir -p /app/public/uploads/avatars /app/public/uploads/notes \
  && chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
