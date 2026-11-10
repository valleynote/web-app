"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  RotateCcw,
  Smile,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";
import {
  confirmDeleteAccountOtpAction,
  requestDeleteAccountOtpAction,
  setPresetAvatarAction,
  updateProfileAction,
  uploadAvatarAction,
} from "@/server/actions/settings";
import UserAvatar from "@/components/app/UserAvatar";
import { AVATAR_PRESET_SEEDS, dicebearAvatar } from "@/lib/avatar";

type Props = {
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  planName: string;
};

function CopyFieldButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${label.toLowerCase()}`}
      aria-label={`Copy ${label.toLowerCase()}`}
      className="inline-flex size-[46px] shrink-0 items-center justify-center rounded-full border border-bg-border bg-white text-muted transition hover:bg-bg-soft hover:text-ink"
    >
      {copied ? (
        <Check size={15} strokeWidth={2} className="text-[#2f7a3e]" />
      ) : (
        <Copy size={15} strokeWidth={1.85} />
      )}
    </button>
  );
}

export function SettingsProfileForm({
  name: initialName,
  email,
  emailVerified,
  image: initialImage,
  createdAt,
  planName,
}: Props) {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState<string | null>(initialImage ?? null);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<"confirm" | "otp">("confirm");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [avatarPending, startAvatarTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const fallbackSeed = useMemo(() => email || name, [email, name]);

  useEffect(() => {
    if (!deleteOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !verifyingOtp) setDeleteOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteOpen, verifyingOtp]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfileAction({
      name,
      image,
    });
    setLoading(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile saved");
  }

  async function resendVerification() {
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/app",
    });
    if (error) {
      toast.error(error.message ?? "Could not resend verification.");
      return;
    }
    toast.success("Verification email sent");
  }

  function pickPreset(seed: string) {
    startAvatarTransition(async () => {
      const result = await setPresetAvatarAction(seed);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      if ("image" in result && result.image) {
        setImage(result.image);
      }
      setPickerOpen(false);
      toast.success("Avatar updated");
    });
  }

  function onUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a PNG, JPG, WEBP, or GIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", file, file.name);
    startAvatarTransition(async () => {
      try {
        const result = await uploadAvatarAction(formData);
        if ("error" in result && result.error) {
          toast.error(result.error);
          return;
        }
        if ("image" in result && result.image) {
          setImage(result.image);
        }
        toast.success("Avatar uploaded");
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again.",
        );
      }
    });
  }

  function openDeleteModal() {
    setOtpStep("confirm");
    setOtp(["", "", "", "", "", ""]);
    setDeleteOpen(true);
  }

  function closeDeleteModal() {
    if (sendingOtp || verifyingOtp) return;
    setDeleteOpen(false);
    setOtpStep("confirm");
    setOtp(["", "", "", "", "", ""]);
  }

  async function sendDeleteOtp() {
    setSendingOtp(true);
    const result = await requestDeleteAccountOtpAction();
    setSendingOtp(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    setOtpStep("otp");
    setOtp(["", "", "", "", "", ""]);
    toast.success("Verification code sent to your email");
    window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, key: string) {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    const next = ["", "", "", "", "", ""];
    digits.forEach((d, i) => {
      next[i] = d;
    });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  async function verifyDeleteOtp() {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setVerifyingOtp(true);
    const result = await confirmDeleteAccountOtpAction(code);
    if ("error" in result && result.error) {
      setVerifyingOtp(false);
      toast.error(result.error);
      return;
    }

    toast.success("Account deleted");
    posthog.reset();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
        onError: () => {
          window.location.href = "/";
        },
      },
    });
  }

  const memberSince = new Date(createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const otpComplete = otp.every((d) => d.length === 1);

  return (
    <div className="space-y-6 font-switzer">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-[22px] border border-bg-line bg-gradient-to-br from-ink to-[#2a2a2a] p-5 text-white md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <UserAvatar
                seed={fallbackSeed}
                name={name}
                image={image}
                size={80}
              />
              <div className="min-w-0">
                <p className="truncate font-inter-tight text-[28px] font-semibold tracking-[-0.03em]">
                  {name || "Untitled"}
                </p>
                <p className="mt-1 truncate text-[13px] text-white/65">
                  {email} · {planName} plan · Member since {memberSince}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={avatarPending}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-ink transition hover:bg-white/90 disabled:opacity-60"
              >
                {avatarPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} strokeWidth={1.85} />
                )}
                Upload image
              </button>
              <button
                type="button"
                disabled={avatarPending}
                onClick={() => setPickerOpen((open) => !open)}
                aria-expanded={pickerOpen}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition disabled:opacity-60 ${
                  pickerOpen
                    ? "border-white/40 bg-white/15 text-white"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                <Smile size={14} strokeWidth={1.85} />
                {pickerOpen ? "Hide avatars" : "Choose avatar"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  onUpload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          {pickerOpen ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-3.5">
              <p className="mb-3 text-[12px] font-medium text-white/65">
                Choose your favorite avatar
              </p>
              <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8">
                {AVATAR_PRESET_SEEDS.map((seed) => {
                  const presetSrc = dicebearAvatar(seed, {
                    style: "notionists-neutral",
                    size: 128,
                  });
                  const selected =
                    !!image &&
                    image.includes("api.dicebear.com") &&
                    image.includes(`seed=${encodeURIComponent(seed)}`);
                  return (
                    <button
                      key={seed}
                      type="button"
                      disabled={avatarPending}
                      onClick={() => pickPreset(seed)}
                      className={`rounded-full p-0.5 transition ${
                        selected
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]"
                          : "hover:bg-white/10"
                      }`}
                      title="Use this avatar"
                      aria-label={`Select avatar ${seed}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={presetSrc}
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full border border-solid border-white/15 bg-white object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[22px] border border-bg-line bg-bg-soft/40 p-5 md:p-6">
          <p className="text-[14px] font-semibold text-ink">Personal info</p>
          <p className="mt-0.5 text-[13px] text-muted">
            How you appear across ValleyNote
          </p>

          <div className="mt-5 grid gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                Full name
              </label>
              <div className="flex items-center gap-2">
                <input
                  className="auth-input min-w-0 flex-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <CopyFieldButton value={name} label="Name" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                Email
              </label>
              <div className="flex items-center gap-2">
                <input
                  className="auth-input min-w-0 flex-1"
                  value={email}
                  disabled
                />
                {emailVerified ? (
                  <span className="inline-flex h-[46px] shrink-0 items-center gap-1 rounded-full border border-[#cfe8d5] bg-[#e8f6ec] px-3.5 text-[12.5px] font-semibold text-[#2f7a3e]">
                    <CheckCircle2 size={14} strokeWidth={1.85} />
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={resendVerification}
                    className="inline-flex h-[46px] shrink-0 items-center rounded-full border border-bg-border bg-white px-3.5 text-[12.5px] font-medium text-blue transition hover:bg-bg-soft"
                  >
                    Resend link
                  </button>
                )}
                <CopyFieldButton value={email} label="Email" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-semibold text-white transition hover:bg-ink-soft disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check size={15} strokeWidth={1.85} />
                Save profile
              </>
            )}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[#ead0cc] bg-[#fff8f7] px-5 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#b42318] shadow-sm">
            <AlertTriangle size={19} strokeWidth={1.85} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink">Danger zone</p>
            <p className="mt-0.5 text-[13px] text-muted">
              Permanently remove your account
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openDeleteModal}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#b42318] px-5 text-[13.5px] font-semibold text-white transition hover:bg-[#912018]"
        >
          <Trash2 size={15} strokeWidth={1.85} />
          Delete account
        </button>
      </div>

      {deleteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
        >
          <div className="w-full max-w-[420px] overflow-hidden rounded-[24px] border border-bg-border bg-white shadow-[0_24px_80px_rgba(26,26,26,0.22)]">
            <div className="flex items-start justify-between gap-3 px-5 pt-6 pb-1">
              <div>
                <p
                  id="delete-account-title"
                  className="text-[15px] font-semibold text-ink"
                >
                  {otpStep === "confirm"
                    ? "Delete your account?"
                    : "Enter verification code"}
                </p>
                <p className="mt-0.5 text-[13px] text-muted">
                  {otpStep === "confirm"
                    ? "This requires email confirmation."
                    : `Code sent to ${email}`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={sendingOtp || verifyingOtp}
                className="rounded-full p-1.5 text-muted transition hover:bg-bg-soft hover:text-ink disabled:opacity-50"
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.85} />
              </button>
            </div>

            <div className="px-5 pt-5 pb-6">
              {otpStep === "confirm" ? (
                <>
                  <ul className="space-y-2 rounded-2xl border border-bg-line bg-bg-soft/60 px-4 py-3.5 text-[13px] text-muted">
                    <li>• You’ll be signed out on every device</li>
                    <li>• Your profile will be marked deleted</li>
                    <li>• You can create a new account with the same email later</li>
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      disabled={sendingOtp}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-bg-border bg-white px-4 text-[13.5px] font-semibold text-ink transition hover:bg-bg-soft disabled:opacity-60"
                    >
                      <X size={15} strokeWidth={1.85} />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={sendDeleteOtp}
                      disabled={sendingOtp}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#b42318] px-4 text-[13.5px] font-semibold text-white transition hover:bg-[#912018] disabled:opacity-60"
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Mail size={15} strokeWidth={1.85} />
                          Send code
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[13px] leading-relaxed text-muted">
                    Enter the 6-digit code we emailed you. It expires in 10
                    minutes.
                  </p>
                  <div className="mt-4 flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleOtpKeyDown(index, e.key)}
                        onPaste={(e) => {
                          e.preventDefault();
                          handleOtpPaste(e.clipboardData.getData("text"));
                        }}
                        className="h-12 w-10 rounded-xl border border-bg-border bg-bg-soft/50 text-center font-inter-tight text-[20px] font-semibold text-ink outline-none transition focus:border-blue focus:bg-white focus:shadow-[0_0_0_3px_rgba(55,69,241,0.15)] sm:h-14 sm:w-12"
                        aria-label={`Digit ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={sendDeleteOtp}
                      disabled={sendingOtp || verifyingOtp}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-bg-border bg-white px-4 text-[13.5px] font-semibold text-ink transition hover:bg-bg-soft disabled:opacity-60"
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Resending…
                        </>
                      ) : (
                        <>
                          <RotateCcw size={15} strokeWidth={1.85} />
                          Resend code
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={verifyDeleteOtp}
                      disabled={!otpComplete || verifyingOtp || sendingOtp}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#b42318] px-4 text-[13.5px] font-semibold text-white transition hover:bg-[#912018] disabled:opacity-50"
                    >
                      {verifyingOtp ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Deleting…
                        </>
                      ) : (
                        <>
                          <Trash2 size={15} strokeWidth={1.85} />
                          Confirm delete
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
