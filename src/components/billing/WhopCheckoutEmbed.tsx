"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  BrandingElement,
  PaymentElement,
  Payments,
  WhopElements,
  usePayments,
  useWhop,
} from "@whop/elements-react";
import { loadWhop } from "@whop/elements";
import { toast } from "sonner";
import { confirmWhopPaymentAction } from "@/server/actions/billing";
import { valleynoteWhopAppearance } from "@/lib/whop-appearance";
import type { BillingInterval, PaidPlanId } from "@/lib/whop-plans";

type Props = {
  planId: PaidPlanId;
  planName: string;
  interval: BillingInterval;
  whopPlanId: string;
  accountId: string;
  userId: string;
  userEmail: string;
  userName: string;
  returnUrl: string;
  dueToday: number;
  /** Matches server WHOP_ENVIRONMENT — Payment Elements sandbox vs production. */
  sandbox?: boolean;
  className?: string;
};

const COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "NL", label: "Netherlands" },
  { code: "ES", label: "Spain" },
  { code: "IT", label: "Italy" },
  { code: "IE", label: "Ireland" },
  { code: "SE", label: "Sweden" },
  { code: "NO", label: "Norway" },
  { code: "DK", label: "Denmark" },
  { code: "CH", label: "Switzerland" },
  { code: "AT", label: "Austria" },
  { code: "BE", label: "Belgium" },
  { code: "PT", label: "Portugal" },
  { code: "PL", label: "Poland" },
  { code: "MA", label: "Morocco" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "SA", label: "Saudi Arabia" },
  { code: "IN", label: "India" },
  { code: "SG", label: "Singapore" },
  { code: "JP", label: "Japan" },
  { code: "BR", label: "Brazil" },
  { code: "MX", label: "Mexico" },
] as const;

const fieldClass =
  "w-full rounded-[14px] border border-bg-border bg-white px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-muted/70 focus:border-ink focus:ring-2 focus:ring-ink/10";

/**
 * Whop Payment Elements (embedded) — same mount pattern as whop-pay:
 * payments.create({ accountId, plan, returnUrl })
 *   → create('branding').mount(...)
 *   → create('payment', { fields: { billingDetails: 'never', phone: 'never' } }).mount(...)
 * Our form supplies billing details; Whop collects the payment method.
 */
export default function WhopCheckoutEmbed(props: Props) {
  const elements = useMemo(() => loadWhop(), []);
  const environment = props.sandbox ? "sandbox" : "production";

  return (
    <div className={props.className}>
      <WhopElements
        elements={elements}
        appearance={valleynoteWhopAppearance}
        environment={environment}
      >
        <Payments
          key={`${props.whopPlanId}-${props.userId}-${environment}`}
          accountId={props.accountId}
          plan={props.whopPlanId}
          returnUrl={props.returnUrl}
          appearance={valleynoteWhopAppearance}
        >
          <EmbeddedPaymentForm {...props} />
        </Payments>
      </WhopElements>
    </div>
  );
}

function EmbeddedPaymentForm({
  planId,
  planName,
  interval,
  whopPlanId,
  userId,
  userEmail,
  userName,
  returnUrl,
  dueToday,
}: Props) {
  const router = useRouter();
  const payments = usePayments();
  const whop = useWhop();
  const [paymentReady, setPaymentReady] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(userName);
  const [country, setCountry] = useState("US");
  const [line1, setLine1] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!payments || !whop) return;

    const trimmedName = name.trim();
    const trimmedLine1 = line1.trim();
    if (!trimmedName) {
      setError("Enter the name on the payment method.");
      return;
    }
    if (!trimmedLine1) {
      setError("Enter a billing address.");
      return;
    }
    if (!postalCode.trim()) {
      setError("Enter a postal / ZIP code.");
      return;
    }
    if (!paymentReady) {
      setError("Complete your payment method.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Same confirm path as whop-pay: mint token with host billing details,
      // confirm server-side, then handleNextAction for 3DS / off-site steps.
      const { confirmationToken } = await payments.createConfirmationToken({
        billingDetails: {
          email: userEmail,
          name: trimmedName,
          address: {
            country,
            line1: trimmedLine1,
            city: city.trim() || undefined,
            postal_code: postalCode.trim() || undefined,
          },
        },
      });

      const result = await confirmWhopPaymentAction({
        confirmationToken,
        plan: planId,
        interval,
        returnUrl,
      });

      if ("error" in result && result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      if (!("ok" in result) || !result.ok) {
        setError("Could not create payment. Try again.");
        setSubmitting(false);
        return;
      }

      const status = String(result.status ?? "").toLowerCase();
      if (status === "paid" || status === "succeeded") {
        toast.success(`You're on ${planName}`);
        router.push(
          `/checkout/complete?status=succeeded&payment=${encodeURIComponent(result.paymentId)}&plan=${planId}&interval=${interval}`,
        );
        return;
      }

      if (!result.clientSecret) {
        setError("Payment needs another step, but no client secret was returned.");
        setSubmitting(false);
        return;
      }

      const next = await whop.payments.handleNextAction({
        clientSecret: result.clientSecret,
        returnUrl,
      });

      if (next.redirected) return;

      if (next.status === "succeeded") {
        toast.success(`You're on ${planName}`);
        router.push(
          `/checkout/complete?status=succeeded&payment=${encodeURIComponent(result.paymentId)}&plan=${planId}&interval=${interval}`,
        );
        return;
      }

      if (next.status === "processing") {
        router.push(
          `/checkout/complete?status=processing&payment=${encodeURIComponent(result.paymentId)}&plan=${planId}&interval=${interval}`,
        );
        return;
      }

      setError(
        next.lastPaymentError?.message ??
          "The payment step wasn't completed. Try again.",
      );
      setSubmitting(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Payment failed. Try again.";
      // Buyer closed Apple Pay / Google Pay / bank Link sheet — not a hard error.
      if (message.includes("payment_request_cancelled")) {
        setError(null);
      } else {
        setError(message);
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12.5px] font-medium text-ink">
            Email
          </span>
          <input
            type="email"
            value={userEmail}
            readOnly
            className={`${fieldClass} bg-bg-soft/70 text-muted`}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12.5px] font-medium text-ink">
            Full name
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="cc-name"
            placeholder="Name on payment method"
            className={fieldClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12.5px] font-medium text-ink">
            Billing address
          </span>
          <input
            type="text"
            required
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            autoComplete="street-address"
            placeholder="Street address"
            className={fieldClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-medium text-ink">
            City
          </span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
            placeholder="City"
            className={fieldClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-medium text-ink">
            Postal code
          </span>
          <input
            type="text"
            required
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            autoComplete="postal-code"
            placeholder="ZIP / postal"
            className={fieldClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12.5px] font-medium text-ink">
            Country
          </span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            autoComplete="country"
            className={fieldClass}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <p className="mb-1.5 text-[12.5px] font-medium text-ink">Payment</p>
        <div
          id="whop-embedded-checkout"
          className="rounded-[14px] border border-bg-border bg-white px-2 py-2"
        >
          {/*
            PaymentElement = payments.create('payment', { fields: { billingDetails: 'never', phone: 'never' } })
            Host form supplies billing; element collects card / wallets / methods.
          */}
          <PaymentElement
            fields={{ billingDetails: "never", phone: "never" }}
            layout="accordion"
            onReady={() => setPaymentLoading(false)}
            onChange={(event) => setPaymentReady(event.complete)}
            onError={(err) => {
              setPaymentLoading(false);
              setPaymentReady(false);
              setError(err.message || "Checkout failed to load.");
            }}
            fallback={
              <div className="flex h-[120px] items-center justify-center gap-2 text-muted">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[13px]">Loading payment methods…</span>
              </div>
            }
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-[13px] font-medium text-[#c45c26]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !paymentReady || paymentLoading}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-semibold text-white transition hover:bg-ink-soft disabled:opacity-55"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing…
          </>
        ) : (
          `Subscribe · $${dueToday}`
        )}
      </button>

      {/* Required MoR notice — payments.create('branding').mount(...) */}
      <div
        id="whop-elements-branding"
        className="opacity-80 [&_iframe]:min-h-0"
      >
        <BrandingElement />
      </div>

      <p className="sr-only">
        Charging Whop plan {whopPlanId} for user {userId}
      </p>
    </form>
  );
}
