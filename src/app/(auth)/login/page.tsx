import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/AuthForm";
import { LoginResetNotice } from "@/components/auth/LoginResetNotice";

export const metadata = {
  title: "Log in — ValleyNote",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your ValleyNote workspace."
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <LoginResetNotice />
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}

function AuthFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 animate-pulse rounded-2xl bg-bg-muted" />
      <div className="h-12 animate-pulse rounded-2xl bg-bg-muted" />
      <div className="h-12 animate-pulse rounded-full bg-bg-muted" />
    </div>
  );
}
