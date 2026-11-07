import Image from "next/image";
import Link from "next/link";
import { assets } from "@/lib/assets";

const highlights = [
  "Smart editor with tags and AI help",
  "Ask my notes with linked sources",
  "Search by meaning across folders",
];

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-dvh bg-bg lg:grid-cols-2 lg:gap-3 lg:p-3">
      {/* Left brand panel */}
      <aside className="relative hidden h-full overflow-hidden rounded-[32px] lg:flex lg:flex-col">
        {/* Background only — clipped so fill image stays inside */}
        <div className="absolute inset-0 overflow-hidden rounded-[32px]">
          <Image
            src={assets.heroBg}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 auth-brand-grid opacity-30" />
          <div className="noise absolute inset-0" />
        </div>

        <div className="relative z-10 flex h-full flex-1 flex-col justify-between p-10 text-white xl:p-14">
          <Link href="/" className="inline-flex w-fit">
            <Image
              src="/dashboard-logo-white-2.svg"
              alt="ValleyNote"
              width={150}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>

          <div className="max-w-[400px]">
            <span className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/25 bg-black/25 px-3 py-1.5 backdrop-blur-[2px]">
              <span className="font-inter-tight text-[13px] font-medium text-white">
                Notebook with grounded AI
              </span>
            </span>
            <h2 className="font-switzer text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] xl:text-[38px]">
              Write, search, and ask in one notebook.
            </h2>
            <ul className="mt-6 space-y-2.5">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 font-switzer text-[14px] text-white/90"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path
                        d="M2.5 6.2 4.8 8.5 9.5 3.5"
                        stroke="#62ff2e"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="font-switzer text-[13px] text-white/55">
            © Moonlight Valley LLC
          </p>
        </div>
      </aside>

      {/* Right form column — remaining 50% */}
      <div className="relative flex h-full min-h-0 flex-1 items-center justify-center overflow-y-auto px-5 py-10 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 50% at 80% 0%, rgba(55,69,241,0.08), transparent), radial-gradient(ellipse 50% 40% at 20% 100%, rgba(98,255,46,0.06), transparent)",
          }}
        />

        <div className="auth-form-enter relative w-full max-w-[400px]">
          <Link href="/" className="mb-8 inline-flex lg:hidden">
            <Image
              src="/logo-dashboard.svg"
              alt="ValleyNote"
              width={140}
              height={36}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <p className="mb-2 font-switzer text-[12px] font-semibold uppercase tracking-[0.18em] text-blue">
            ValleyNote
          </p>
          <h1 className="font-inter-tight text-[30px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 font-switzer text-[15px] leading-snug text-muted">
              {subtitle}
            </p>
          ) : null}
          <div className="mt-7">{children}</div>

          <p className="mt-8 text-center font-switzer text-[12px] text-muted-3 lg:hidden">
            © Moonlight Valley LLC
          </p>
        </div>
      </div>
    </div>
  );
}
