"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const passwordRules = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    id: "upper",
    label: "One uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "One number",
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    id: "special",
    label: "One special character",
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
] as const;

function getPasswordChecks(password: string) {
  return passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));
}

function isPasswordStrong(password: string) {
  return getPasswordChecks(password).every((rule) => rule.passed);
}

function isUnverifiedError(message?: string | null, code?: string | null) {
  const hay = `${code ?? ""} ${message ?? ""}`.toLowerCase();
  return (
    hay.includes("email_not_verified") || hay.includes("email not verified")
  );
}

function PasswordRequirements({ password }: { password: string }) {
  const checks = useMemo(() => getPasswordChecks(password), [password]);
  const passedCount = checks.filter((rule) => rule.passed).length;
  const allPassed = passedCount === checks.length;

  if (!password || allPassed) return null;

  return (
    <div className="mt-3 rounded-[18px] border border-bg-border/80 bg-bg-soft/70 px-3.5 py-3">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <p className="font-switzer text-[12px] font-medium text-ink-soft">
          Password requirements
        </p>
        <p
          className={`font-switzer text-[12px] font-medium ${
            passedCount >= 2 ? "text-orange" : "text-muted"
          }`}
        >
          {passedCount}/{checks.length} met
        </p>
      </div>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {checks.map((rule) => (
          <li
            key={rule.id}
            className={`flex items-center gap-2 font-switzer text-[12.5px] transition-colors ${
              rule.passed ? "text-ink" : "text-muted"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                rule.passed
                  ? "bg-[#62ff2e] text-[#1a1a1a]"
                  : "border border-bg-border bg-white text-transparent"
              }`}
              aria-hidden
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.2 4.8 8.5 9.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PasswordMatchHint({
  password,
  confirm,
}: {
  password: string;
  confirm: string;
}) {
  if (!confirm || confirm === password) return null;

  return (
    <p className="mt-2 font-switzer text-[12.5px] text-[#b42318]">
      Passwords do not match.
    </p>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 3l18 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M10.6 10.7a2.2 2.2 0 0 0 3 3M9.9 5.6A10.6 10.6 0 0 1 12 5.4c5 0 8.7 3.7 10.2 6.6a1.2 1.2 0 0 1 0 1.2c-.6 1.1-1.7 2.5-3.3 3.7M6.1 6.3C4.2 7.6 2.9 9.2 2 10.8a1.2 1.2 0 0 0 0 1.2C3.5 14.9 7.2 18.6 12 18.6c1.2 0 2.3-.2 3.4-.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-6.6 10-6.6S22 12 22 12s-3.5 6.6-10 6.6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="auth-input pr-11"
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-bg-soft hover:text-ink"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5.5 15.5 12 9 18.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SubmitButton({
  loading,
  idle,
  busy,
  chevron = false,
}: {
  loading: boolean;
  idle: string;
  busy: string;
  chevron?: boolean;
}) {
  return (
    <button type="submit" disabled={loading} className="auth-primary">
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="auth-spinner" aria-hidden />
          {busy}
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-1.5">
          {idle}
          {chevron ? <ChevronRightIcon /> : null}
        </span>
      )}
    </button>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isPasswordStrong(password)) {
      toast.error("Please meet all password requirements before continuing.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: err } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      callbackURL: "/choose-plan",
    });
    setLoading(false);
    if (err) {
      toast.error(err.message ?? "Could not create account.");
      return;
    }
    toast.success("Account created — verify your email to continue.");
    router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 font-switzer">
      <Field label="Name" htmlFor="name">
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="auth-input"
          placeholder="Full name"
          autoComplete="name"
        />
      </Field>
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
          placeholder="Enter your email"
          autoComplete="email"
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <PasswordInput
          id="password"
          value={password}
          onChange={setPassword}
          placeholder="Create a password"
          autoComplete="new-password"
          minLength={8}
        />
        <PasswordRequirements password={password} />
      </Field>
      <Field label="Confirm password" htmlFor="confirm">
        <PasswordInput
          id="confirm"
          value={confirm}
          onChange={setConfirm}
          placeholder="Confirm your password"
          autoComplete="new-password"
          minLength={8}
        />
        <PasswordMatchHint password={password} confirm={confirm} />
      </Field>
      <SubmitButton
        loading={loading}
        idle="Get started free"
        busy="Creating account…"
        chevron
      />
      <p className="text-center text-[14px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const trimmed = email.trim();
    const { error: err } = await authClient.signIn.email({
      email: trimmed,
      password,
      rememberMe: remember,
      callbackURL: next,
    });
    setLoading(false);
    if (err) {
      if (isUnverifiedError(err.message, (err as { code?: string }).code)) {
        toast.info("Please verify your email before signing in.");
        router.push(
          `/verify-email?email=${encodeURIComponent(trimmed)}&resent=1`,
        );
        return;
      }
      toast.error(err.message ?? "Invalid email or password.");
      return;
    }
    toast.success("Welcome back");
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 font-switzer">
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
          placeholder="Enter your email"
          autoComplete="email"
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <PasswordInput
          id="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </Field>
      <div className="flex items-center justify-between text-[14px]">
        <label className="group flex cursor-pointer items-center gap-2.5 text-muted">
          <span className="relative flex h-[18px] w-[18px] items-center justify-center">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="peer sr-only"
            />
            <span className="h-[18px] w-[18px] rounded-[5px] border border-bg-border bg-white transition peer-checked:border-blue peer-checked:bg-blue peer-focus-visible:ring-2 peer-focus-visible:ring-blue/25" />
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition peer-checked:opacity-100"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
            >
              <path
                d="M2.5 6.2 4.8 8.5 9.5 3.5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="font-medium text-blue hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <SubmitButton
        loading={loading}
        idle="Log in"
        busy="Signing in…"
        chevron
      />
      <p className="text-center text-[14px] text-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-blue hover:underline">
          Get started free
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error: err } = await authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (err) {
      toast.error(err.message ?? "Could not send reset email.");
      return;
    }
    setDone(true);
    toast.success("Reset link sent — check your inbox.");
  }

  if (done) {
    return (
      <div className="space-y-5 font-switzer">
        <p className="rounded-[14px] border border-bg-border bg-bg-soft/70 px-3.5 py-3 text-[13.5px] leading-relaxed text-muted">
          If an account exists for that email, we sent a reset link. Check your
          inbox and spam folder.
        </p>
        <Link href="/login" className="auth-secondary">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 font-switzer">
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
          placeholder="Enter your email"
          autoComplete="email"
        />
      </Field>
      <SubmitButton
        loading={loading}
        idle="Send reset link"
        busy="Sending…"
        chevron
      />
      <p className="text-center text-[14px] text-muted">
        <Link href="/login" className="font-medium text-blue hover:underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      toast.error("This reset link is missing or invalid. Request a new one.");
      return;
    }
    if (!isPasswordStrong(password)) {
      toast.error("Please meet all password requirements before continuing.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: err } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (err) {
      toast.error(err.message ?? "Could not reset password.");
      return;
    }
    toast.success("Password updated");
    router.push("/login?reset=1");
  }

  if (!token) {
    return (
      <div className="space-y-5 font-switzer">
        <p className="rounded-[14px] border border-[#f5c2c2] bg-[#fff5f5] px-3.5 py-3 text-[13.5px] leading-relaxed text-[#b42318]">
          This reset link is missing or expired. Request a fresh one to
          continue.
        </p>
        <Link href="/forgot-password" className="auth-primary text-center">
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 font-switzer">
      <Field label="New password" htmlFor="password">
        <PasswordInput
          id="password"
          value={password}
          onChange={setPassword}
          placeholder="Create a new password"
          autoComplete="new-password"
          minLength={8}
        />
        <PasswordRequirements password={password} />
      </Field>
      <Field label="Confirm password" htmlFor="confirm">
        <PasswordInput
          id="confirm"
          value={confirm}
          onChange={setConfirm}
          placeholder="Confirm your new password"
          autoComplete="new-password"
          minLength={8}
        />
        <PasswordMatchHint password={password} confirm={confirm} />
      </Field>
      <SubmitButton
        loading={loading}
        idle="Update password"
        busy="Saving…"
        chevron
      />
    </form>
  );
}

export function VerifyEmailPanel() {
  const params = useSearchParams();
  const emailParam = params.get("email") ?? "";
  const resent = params.get("resent") === "1";
  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);

  async function resend(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Enter the email you signed up with.");
      return;
    }
    setLoading(true);
    const { error } = await authClient.sendVerificationEmail({
      email: trimmed,
      callbackURL: "/app",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Could not resend verification email.");
      return;
    }
    toast.success("Verification email sent — check your inbox.");
  }

  return (
    <div className="space-y-5 font-switzer">
      <p className="rounded-[14px] border border-bg-border bg-bg-soft/70 px-3.5 py-3 text-[13.5px] leading-relaxed text-muted">
        {resent
          ? "We sent a fresh verification link. Check your inbox and spam folder."
          : "Open the link we emailed you to verify your account and unlock AI features."}
      </p>

      <form onSubmit={resend} className="space-y-4">
        <Field label="Email" htmlFor="verify-email">
          <input
            id="verify-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="Enter your email"
            autoComplete="email"
          />
        </Field>
        <SubmitButton
          loading={loading}
          idle="Resend verification email"
          busy="Sending…"
          chevron
        />
      </form>

      <Link href="/login" className="auth-secondary">
        Back to log in
      </Link>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[13px] font-medium text-ink-soft"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
