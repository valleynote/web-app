"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { syncWhopPaymentAction } from "@/server/actions/billing";

export default function CheckoutSync({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("Syncing your plan…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let attempts = 0;
    let cancelled = false;

    async function sync() {
      attempts += 1;
      const result = await syncWhopPaymentAction({ paymentId });
      if (cancelled) return;

      if ("ok" in result && result.ok) {
        setMessage(`Activated ${result.planName}`);
        toast.success(`You're on ${result.planName}`);
        router.push("/app");
        router.refresh();
        return;
      }

      if (attempts < 6) {
        setMessage("Still confirming with Whop…");
        window.setTimeout(() => {
          void sync();
        }, 1500);
        return;
      }

      setMessage(
        "Payment is processing. Your plan will unlock automatically in a moment.",
      );
    }

    void sync();
    return () => {
      cancelled = true;
    };
  }, [paymentId, router]);

  return <p className="text-[13px] font-medium text-ink">{message}</p>;
}
