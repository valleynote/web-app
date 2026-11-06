import { redirect } from "next/navigation";

type Search = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Legacy path — Whop return URLs may still hit /app/checkout/complete. */
export default async function LegacyCheckoutCompleteRedirect({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const key of ["status", "payment", "plan", "interval"] as const) {
    const value = first(params[key]);
    if (value) qs.set(key, value);
  }
  const suffix = qs.toString();
  redirect(suffix ? `/checkout/complete?${suffix}` : "/checkout/complete");
}
