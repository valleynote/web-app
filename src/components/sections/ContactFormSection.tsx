"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitContactAction } from "@/server/actions/contact";

export default function ContactFormSection() {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitContactAction(form);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Message sent. We'll get back to you soon.");
      setForm({ firstName: "", lastName: "", email: "", message: "" });
    });
  }

  return (
    <section className="relative px-4 pb-16 pt-12 font-switzer sm:px-6 md:px-[150px] md:pb-24 md:pt-16">
      <div className="mx-auto w-full max-w-[560px] auth-form-enter">
        <p className="font-sans text-[12px] font-light uppercase tracking-[0.22em] text-blue">
          Contact
        </p>
        <h1 className="mt-3 font-inter-tight text-[24px] font-semibold tracking-[-0.03em] text-ink md:text-[28px]">
          Send us a message
        </h1>
        <p className="mt-2 text-[14px] font-medium tracking-[-0.02em] text-muted">
          We usually reply within one business day.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-left">
              <span className="mb-2 block text-[13px] font-medium tracking-[-0.02em] text-ink">
                First Name
              </span>
              <input
                required
                name="firstName"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Your first name"
                className="auth-input"
              />
            </label>
            <label className="block text-left">
              <span className="mb-2 block text-[13px] font-medium tracking-[-0.02em] text-ink">
                Last Name
              </span>
              <input
                required
                name="lastName"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Your last name"
                className="auth-input"
              />
            </label>
          </div>

          <label className="block text-left">
            <span className="mb-2 block text-[13px] font-medium tracking-[-0.02em] text-ink">
              Email
            </span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="Your email"
              className="auth-input"
            />
          </label>

          <label className="block text-left">
            <span className="mb-2 block text-[13px] font-medium tracking-[-0.02em] text-ink">
              Message
            </span>
            <textarea
              required
              name="message"
              rows={6}
              minLength={10}
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="Your message"
              className="auth-textarea"
            />
          </label>

          <button type="submit" disabled={pending} className="auth-primary mt-2">
            {pending ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="auth-spinner" aria-hidden />
                Sending…
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-1.5">
                Send message
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="shrink-0"
                >
                  <path
                    d="M9 5.5 15.5 12 9 18.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
