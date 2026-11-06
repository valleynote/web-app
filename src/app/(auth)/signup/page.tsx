import AuthShell from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign up — ValleyNote",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Get started free"
      subtitle="Create your ValleyNote account in under a minute."
    >
      <SignUpForm />
    </AuthShell>
  );
}
