import { IconArrowRightUp } from "@/components/Icons";
import { CONTACT_DETAILS } from "@/lib/contact";

type Detail = {
  label: string;
  href?: string;
  external?: boolean;
  lines: string[];
};

const details: Detail[] = [
  {
    label: "Email",
    href: `mailto:${CONTACT_DETAILS.email}`,
    lines: [CONTACT_DETAILS.email],
  },
  ...(CONTACT_DETAILS.phone
    ? [
        {
          label: "Phone",
          href: CONTACT_DETAILS.phoneHref || undefined,
          lines: [CONTACT_DETAILS.phone],
        } satisfies Detail,
      ]
    : []),
  {
    label: "Address",
    href: `https://maps.google.com/?q=${encodeURIComponent(CONTACT_DETAILS.mapsQuery)}`,
    external: true,
    lines: [
      CONTACT_DETAILS.company,
      CONTACT_DETAILS.addressLines.join(", "),
    ],
  },
];

export default function ContactDetailsSection() {
  return (
    <section className="scroll-mt-28 font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="border-t border-dashed border-bg-border pt-10 md:pt-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-blue">
              Contact details
            </p>
            <h2 className="mt-3 font-inter-tight text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px]">
              Reach Moonlight Valley
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted sm:mt-4 sm:text-[15px]">
              Prefer email, a call, or mail? Here is how to reach the ValleyNote
              team directly.
            </p>
          </div>

          <ul className="mt-8 space-y-0 border-t border-dashed border-bg-border sm:mt-10">
            {details.map((detail) => {
              const value = (
                <span className="min-w-0 text-[15px] font-medium leading-relaxed tracking-[-0.02em] text-ink sm:text-[16px]">
                  {detail.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              );

              const rowClass =
                "grid grid-cols-[72px_minmax(0,1fr)_auto] items-start gap-2 py-5 sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:gap-2.5 sm:py-6";

              const label = (
                <span className="flex h-6 items-center font-inter-tight text-[16px] font-semibold tracking-[-0.02em] text-blue sm:h-7 sm:text-[18px]">
                  {detail.label}
                </span>
              );

              const arrow = (
                <span className="flex h-6 items-center sm:h-7">
                  <IconArrowRightUp
                    size={22}
                    className="shrink-0 text-blue transition group-hover:text-ink sm:size-6"
                  />
                </span>
              );

              return (
                <li
                  key={detail.label}
                  className="border-b border-dashed border-bg-border"
                >
                  {detail.href ? (
                    <a
                      href={detail.href}
                      target={detail.external ? "_blank" : undefined}
                      rel={detail.external ? "noopener noreferrer" : undefined}
                      className={`group ${rowClass} transition hover:text-blue`}
                    >
                      {label}
                      {value}
                      {arrow}
                    </a>
                  ) : (
                    <div className={rowClass}>
                      {label}
                      {value}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
