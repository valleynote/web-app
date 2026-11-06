import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { VerifyEmailPanel } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Verify email — ValleyNote",
};

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Check your email"
      subtitle="Confirm your address to unlock AI features in ValleyNote."
    >
      <Suspense
        fallback={
          <p className="font-switzer text-[15px] text-muted">Loading…</p>
        }
      >
        <VerifyEmailPanel />
      </Suspense>
    </AuthShell>
  );
}
