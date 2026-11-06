import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import CheckoutSync from "@/components/billing/CheckoutSync";
import { assets } from "@/lib/assets";
import { requireSession } from "@/lib/session";

export const metadata = {
  title: "Checkout — ValleyNote",
};

type Search = {
  status?: string;
  payment?: string;
  plan?: string;
  interval?: string;
};

export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireSession();
  const params = await searchParams;
  const status = params.status ?? "processing";
  const paymentId = params.payment ?? null;

  const succeeded = status === "succeeded" || status === "success";
  const failed =
    status === "failed" || status === "canceled" || status === "error";

  const retryHref =
    params.plan && (params.interval === "monthly" || params.interval === "yearly")
      ? `/checkout?plan=${params.plan}&interval=${params.interval}`
      : "/choose-plan";

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center px-4 py-12">
      <Link href="/app" className="mb-8 inline-flex self-start">
        <Image
          src={assets.logo}
          alt="ValleyNote"
          width={152}
          height={36}
          className="h-8 w-auto"
          priority
        />
      </Link>
      <div className="w-full rounded-[24px] border border-bg-line bg-white p-6 shadow-[0_16px_50px_rgba(26,26,26,0.06)] sm:p-8">
        {succeeded ? (
          <div className="space-y-3">
            <CheckCircle2 className="text-ink" size={28} />
            <h1 className="font-inter-tight text-[24px] font-semibold text-ink">
              Payment received
            </h1>
            <p className="text-[14px] leading-relaxed text-muted">
              Your plan is activating now. You&apos;ll land in the app as soon
              as sync finishes.
            </p>
            {paymentId ? <CheckoutSync paymentId={paymentId} /> : null}
          </div>
        ) : failed ? (
          <div className="space-y-3">
            <CircleAlert className="text-[#c45c26]" size={28} />
            <h1 className="font-inter-tight text-[24px] font-semibold text-ink">
              Payment did not go through
            </h1>
            <p className="text-[14px] leading-relaxed text-muted">
              No charge was completed. You can try again or pick a different
              plan.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <LoaderCircle className="animate-spin text-ink" size={28} />
            <h1 className="font-inter-tight text-[24px] font-semibold text-ink">
              Confirming payment
            </h1>
            <p className="text-[14px] leading-relaxed text-muted">
              We&apos;re waiting for confirmation. This usually takes a few
              seconds.
            </p>
            {paymentId ? <CheckoutSync paymentId={paymentId} /> : null}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {failed ? (
            <Link
              href={retryHref}
              className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-[13.5px] font-semibold text-white hover:bg-ink-soft"
            >
              Try again
            </Link>
          ) : (
            <Link
              href="/app"
              className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-[13.5px] font-semibold text-white hover:bg-ink-soft"
            >
              Go to app
            </Link>
          )}
          <Link
            href="/choose-plan"
            className="inline-flex h-11 items-center justify-center rounded-full border border-bg-border bg-white px-5 text-[13.5px] font-semibold text-ink hover:bg-bg-soft"
          >
            Change plan
          </Link>
        </div>
      </div>
    </div>
  );
}
