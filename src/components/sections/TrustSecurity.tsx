import {
  BadgeCheck,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const badges: {
  title: string;
  detail: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "PCI DSS",
    detail: "Payment data protected",
    Icon: CreditCard,
  },
  {
    title: "GDPR",
    detail: "Privacy rights respected",
    Icon: ShieldCheck,
  },
  {
    title: "SOC 2",
    detail: "Controls independently audited",
    Icon: BadgeCheck,
  },
  {
    title: "SSL/TLS",
    detail: "Encrypted in transit",
    Icon: LockKeyhole,
  },
];

export default function TrustSecurity() {
  return (
    <section className="scroll-mt-28 font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[1140px]">
          <div className="mx-auto max-w-[640px] text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-blue">
              Trust &amp; security
            </p>
            <h2 className="mt-3 font-inter-tight text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px] md:text-[44px] md:leading-[1.1]">
              Built to enterprise standard
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-3 sm:mt-10 sm:gap-4 md:mt-12 md:gap-5">
            {badges.map((badge) => (
              <article
                key={badge.title}
                className="group rounded-[14px] border border-solid border-bg-border bg-transparent px-2.5 py-4 transition duration-300 ease-out hover:border-blue sm:rounded-[18px] sm:px-4 sm:py-6 md:rounded-[20px] md:px-5 md:py-7"
              >
                <badge.Icon
                  strokeWidth={1.55}
                  aria-hidden
                  className="h-8 w-8 text-blue transition-colors duration-300 ease-out group-hover:text-ink sm:h-9 sm:w-9 md:h-10 md:w-10"
                />

                <h3 className="mt-3 font-inter-tight text-[13px] font-semibold tracking-[-0.03em] text-ink sm:mt-5 sm:text-[18px] md:text-[20px]">
                  {badge.title}
                </h3>

                <p className="mt-2 hidden text-[13px] font-medium leading-snug tracking-[-0.01em] text-muted sm:mt-2.5 sm:block sm:text-[14px]">
                  {badge.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
