"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Monitor,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  revokeOtherSessionsAction,
  revokeSessionAction,
} from "@/server/actions/settings";

export type SessionRow = {
  id: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  current: boolean;
};

type Props = {
  email: string;
  emailVerified: boolean;
  sessions: SessionRow[];
};

function parseDevice(userAgent: string | null) {
  if (!userAgent) return { label: "Unknown device", mobile: false };
  const ua = userAgent.toLowerCase();
  const mobile = /mobile|iphone|android/.test(ua);
  let browser = "Browser";
  if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("edg")) browser = "Edge";

  let os = "device";
  if (ua.includes("mac os")) os = "macOS";
  else if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  else if (ua.includes("linux")) os = "Linux";

  return { label: `${browser} on ${os}`, mobile };
}

function formatRelative(iso: string) {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function SettingsSecurityPanel({
  email,
  emailVerified,
  sessions,
}: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOthers, setRevokeOthers] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: revokeOthers,
    });
    setPasswordLoading(false);
    if (error) {
      toast.error(error.message ?? "Could not change password");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success(
      revokeOthers
        ? "Password updated · other sessions signed out"
        : "Password updated",
    );
  }

  async function resendVerification() {
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/app",
    });
    if (error) {
      toast.error(error.message ?? "Could not resend verification");
      return;
    }
    toast.success("Verification email sent");
  }

  function revokeOne(token: string) {
    startTransition(async () => {
      const result = await revokeSessionAction(token);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Session revoked");
    });
  }

  function revokeOthersOnly() {
    startTransition(async () => {
      const result = await revokeOtherSessionsAction();
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Signed out of other devices");
    });
  }

  const otherCount = sessions.filter((s) => !s.current).length;

  return (
    <div className="space-y-6 font-switzer">
      <div className="rounded-[22px] border border-bg-line bg-gradient-to-br from-ink to-[#2a2a2a] p-5 text-white md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-white/55">
              Account security
            </p>
            <p className="mt-2 font-inter-tight text-[28px] font-semibold tracking-[-0.03em]">
              {sessions.length} active session{sessions.length === 1 ? "" : "s"}
            </p>
            <p className="mt-1.5 text-[13px] text-white/65">
              {emailVerified
                ? "Email verified · protect your account with a strong password"
                : "Verify your email to unlock AI features"}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
              emailVerified
                ? "bg-[#e8f6ec] text-[#2f7a3e]"
                : "bg-[#fff4e5] text-[#b45309]"
            }`}
          >
            {emailVerified ? "Protected" : "Action needed"}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-[20px] border border-bg-line bg-bg-soft/50 p-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink shadow-sm">
              <Mail size={17} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink">Email verification</p>
              <p className="mt-0.5 text-[13px] text-muted">
                {emailVerified
                  ? "Your email is verified."
                  : "Verify to unlock AI features."}
              </p>
            </div>
          </div>
          {!emailVerified ? (
            <button
              type="button"
              onClick={resendVerification}
              className="inline-flex shrink-0 items-center rounded-full border border-bg-border bg-white px-3.5 py-2 text-[12.5px] font-medium text-ink transition hover:bg-bg-soft"
            >
              Resend verification
            </button>
          ) : (
            <p className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-medium text-[#2f7a3e]">
              <CheckCircle2 size={14} strokeWidth={1.85} />
              Verified
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-[20px] border border-bg-line bg-bg-soft/50 p-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink shadow-sm">
              <ShieldCheck size={17} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink">Session hygiene</p>
              <p className="mt-0.5 text-[13px] text-muted">
                {otherCount === 0
                  ? "Only this device is signed in."
                  : `${otherCount} other device${otherCount === 1 ? "" : "s"} signed in.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={pending || otherCount === 0}
            onClick={revokeOthersOnly}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-bg-border bg-white px-3.5 py-2 text-[12.5px] font-medium text-ink transition hover:bg-bg-soft disabled:opacity-50"
          >
            {pending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <LogOut size={13} strokeWidth={1.85} />
            )}
            Sign out others
          </button>
        </div>
      </div>

      <form
        onSubmit={onChangePassword}
        className="rounded-[22px] border border-bg-line bg-bg-soft/40 p-5 md:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink shadow-sm">
            <KeyRound size={17} strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink">Change password</p>
            <p className="mt-0.5 text-[13px] text-muted">
              Use at least 8 characters. Optionally sign out other devices.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
              Current password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="auth-input"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
              New password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="auth-input"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
              Confirm new password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="auth-input"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={revokeOthers}
            onChange={(e) => setRevokeOthers(e.target.checked)}
            className="h-4 w-4 rounded border-bg-border text-blue accent-[var(--blue)]"
          />
          Sign out of all other sessions after changing
        </label>

        <button
          type="submit"
          disabled={passwordLoading}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-semibold text-white transition hover:bg-ink-soft disabled:opacity-60"
        >
          {passwordLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Updating…
            </>
          ) : (
            <>
              <KeyRound size={15} strokeWidth={1.85} />
              Update password
            </>
          )}
        </button>
      </form>

      <div className="rounded-[22px] border border-bg-line bg-bg-soft/40 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[14px] font-semibold text-ink">Active sessions</p>
            <p className="mt-0.5 text-[13px] text-muted">
              Devices currently signed in to your account
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2.5">
          {sessions.map((row) => {
            const device = parseDevice(row.userAgent);
            const Icon = device.mobile ? Smartphone : Monitor;
            return (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-bg-line bg-white px-4 py-3.5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-bg-soft text-ink">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-ink">
                      {device.label}
                      {row.current ? (
                        <span className="ml-2 rounded-full bg-blue/10 px-2 py-0.5 text-[11px] font-semibold text-blue">
                          This device
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {row.ipAddress ? `${row.ipAddress} · ` : ""}
                      Last active {formatRelative(row.updatedAt)}
                    </p>
                  </div>
                </div>
                {!row.current ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => revokeOne(row.token)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-bg-border px-3 py-2 text-[12.5px] font-medium text-[#b42318] transition hover:bg-[#fff5f4] disabled:opacity-50"
                  >
                    <Trash2 size={13} strokeWidth={1.85} />
                    Revoke
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
