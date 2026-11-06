import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Reset password — ValleyNote",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="This link works once and expires in an hour."
    >
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-12 animate-pulse rounded-2xl bg-bg-muted" />
            <div className="h-12 animate-pulse rounded-2xl bg-bg-muted" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
