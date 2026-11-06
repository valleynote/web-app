import AuthShell from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Forgot password — ValleyNote",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot password"
      subtitle="We’ll email you a one-time reset link that expires in an hour."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
