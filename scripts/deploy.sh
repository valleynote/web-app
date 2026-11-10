#!/usr/bin/env bash
# Deploy ValleyNote to the production VPS.
# Secrets live in .deploy/credentials.env (never committed).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CREDS="$ROOT/.deploy/credentials.env"

if [[ ! -f "$CREDS" ]]; then
  echo "Missing $CREDS" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a && source "$CREDS" && set +a

SSH_KEY="${VPS_SSH_KEY/#\~/$HOME}"
REMOTE="${VPS_USER}@${VPS_HOST}"
REMOTE_DIR="/opt/valleynote"
SSH=(ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)

echo "==> Ensuring remote directory"
"${SSH[@]}" "$REMOTE" "mkdir -p $REMOTE_DIR"

echo "==> Syncing repo to VPS"
rsync -az --delete \
  -e "ssh -i $SSH_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.deploy' \
  --exclude '.env' \
  --exclude '.env.*' \
  --exclude 'public/uploads/avatars/*' \
  --exclude 'public/uploads/notes/*' \
  --exclude '*.pdf' \
  --exclude '.DS_Store' \
  --exclude 'tsconfig.tsbuildinfo' \
  "$ROOT/" "$REMOTE:$REMOTE_DIR/"

echo "==> Writing production env on VPS"
"${SSH[@]}" "$REMOTE" "cat > $REMOTE_DIR/.env.production" <<EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=${APP_URL}
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB}
BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
BETTER_AUTH_URL=${BETTER_AUTH_URL}
BETTER_AUTH_TRUSTED_ORIGINS=${BETTER_AUTH_TRUSTED_ORIGINS:-}
HEALTH_CHECK_TOKEN=${HEALTH_CHECK_TOKEN:-}
RESEND_API_KEY=${RESEND_API_KEY:-}
EMAIL_FROM="${EMAIL_FROM}"
AI_PROVIDER=${AI_PROVIDER:-openrouter}
OPENROUTER_API_KEY=${OPENROUTER_API_KEY:-}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
AI_CHAT_MODEL=${AI_CHAT_MODEL:-}
AI_EMBEDDING_MODEL=${AI_EMBEDDING_MODEL:-}
AI_TRANSCRIPTION_MODEL=${AI_TRANSCRIPTION_MODEL:-}
S3_ENDPOINT=${S3_ENDPOINT:-}
S3_REGION=${S3_REGION:-auto}
S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID:-}
S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY:-}
S3_BUCKET=${S3_BUCKET:-valleynote}
S3_PUBLIC_URL=${S3_PUBLIC_URL:-}
WHOP_ENVIRONMENT=${WHOP_ENVIRONMENT:-production}
WHOP_API_KEY=${WHOP_API_KEY:-}
WHOP_ACCOUNT_ID=${WHOP_ACCOUNT_ID:-}
WHOP_WEBHOOK_SECRET=${WHOP_WEBHOOK_SECRET:-}
NEXT_PUBLIC_WHOP_PLAN_BASIC_MONTHLY=${NEXT_PUBLIC_WHOP_PLAN_BASIC_MONTHLY:-}
NEXT_PUBLIC_WHOP_PLAN_BASIC_YEARLY=${NEXT_PUBLIC_WHOP_PLAN_BASIC_YEARLY:-}
NEXT_PUBLIC_WHOP_PLAN_PLUS_MONTHLY=${NEXT_PUBLIC_WHOP_PLAN_PLUS_MONTHLY:-}
NEXT_PUBLIC_WHOP_PLAN_PLUS_YEARLY=${NEXT_PUBLIC_WHOP_PLAN_PLUS_YEARLY:-}
NEXT_PUBLIC_WHOP_PLAN_PRO_MONTHLY=${NEXT_PUBLIC_WHOP_PLAN_PRO_MONTHLY:-}
NEXT_PUBLIC_WHOP_PLAN_PRO_YEARLY=${NEXT_PUBLIC_WHOP_PLAN_PRO_YEARLY:-}
FEATURE_PRO_TRIAL=${FEATURE_PRO_TRIAL:-false}
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=${NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN:-}
NEXT_PUBLIC_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST:-https://eu.i.posthog.com}
POSTHOG_PROJECT_ID=${POSTHOG_PROJECT_ID:-}
EOF

"${SSH[@]}" "$REMOTE" "cp $REMOTE_DIR/.env.production $REMOTE_DIR/.env && chmod 600 $REMOTE_DIR/.env $REMOTE_DIR/.env.production"

echo "==> Building and starting stack (this can take several minutes)"
"${SSH[@]}" "$REMOTE" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build --force-recreate"

echo "==> Reloading Caddy config"
"${SSH[@]}" "$REMOTE" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml exec -T caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || docker compose -f docker-compose.prod.yml restart caddy"

echo "==> Waiting for site"
for i in $(seq 1 60); do
  code=$(curl -sS -o /dev/null -w "%{http_code}" "https://${DOMAIN}/" 2>/dev/null || echo 000)
  if [[ "$code" =~ ^2|3 ]]; then
    echo "==> Live at https://${DOMAIN} (HTTP $code)"
    exit 0
  fi
  sleep 5
done

echo "Deploy finished; HTTPS not green yet. Logs:"
"${SSH[@]}" "$REMOTE" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml logs --tail=60 web caddy migrate" || true
exit 0
