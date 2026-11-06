import { WhopClient, WhopEnvironment } from "@whop/sdk";

let client: WhopClient | null = null;

export function getWhopAccountId() {
  const id = process.env.WHOP_ACCOUNT_ID?.trim();
  if (!id) {
    throw new Error("WHOP_ACCOUNT_ID is not configured");
  }
  return id;
}

export function getWhopApiKey() {
  const key = process.env.WHOP_API_KEY?.trim();
  if (!key) {
    throw new Error("WHOP_API_KEY is not configured");
  }
  return key;
}

export function isWhopConfigured() {
  return Boolean(
    process.env.WHOP_API_KEY?.trim() && process.env.WHOP_ACCOUNT_ID?.trim(),
  );
}

export function getWhopClient() {
  if (client) return client;

  const apiKey = getWhopApiKey();
  const env =
    process.env.WHOP_ENVIRONMENT === "sandbox"
      ? WhopEnvironment.Sandbox
      : WhopEnvironment.Production;

  client = new WhopClient({
    token: apiKey,
    environment: env,
  });

  return client;
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
