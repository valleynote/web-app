const points = [
  {
    label: "Company",
    title: "Moonlight Valley LLC",
    description:
      "We're a small team building ValleyNote, a calm AI notebook for people who write a lot.",
  },
  {
    label: "Product",
    title: "Notes that stay useful",
    description:
      "Capture ideas, search by meaning, and ask questions grounded in what you already wrote.",
  },
  {
    label: "For",
    title: "Students to founders",
    description:
      "Built for anyone who needs writing, context, and answers in one private workspace.",
  },
];

export default function AboutMission() {
  return (
    <section className="scroll-mt-28 font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[1140px]">
          <div className="w-full border-b border-dashed border-bg-border pb-7 sm:pb-8 md:pb-10">
            <div className="max-w-[640px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-blue">
                About us
              </p>
              <h1 className="mt-3 font-inter-tight text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px] md:text-[44px] md:leading-[1.12]">
                An AI notebook for modern minds
              </h1>
              <p className="mt-3 max-w-[540px] text-[14px] leading-relaxed text-muted sm:mt-4 sm:text-[15px] md:text-[16px]">
                ValleyNote is built by Moonlight Valley LLC to help you write,
                organize, and get answers from your own notes without the noise.
              </p>
            </div>
          </div>

          <div className="grid gap-0 border-b border-dashed border-bg-border md:grid-cols-3">
            {points.map((point, index) => (
              <article
                key={point.title}
                className={`flex flex-col border-b border-dashed border-bg-border px-0 py-7 last:border-b-0 sm:py-8 md:border-b-0 md:px-5 md:py-10 ${
                  index > 0
                    ? "md:border-l md:border-dashed md:border-bg-border"
                    : ""
                } ${index === 0 ? "md:pl-0" : ""} ${
                  index === points.length - 1 ? "md:pr-0" : ""
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue">
                  {point.label}
                </p>
                <h3 className="mt-2 font-inter-tight text-[19px] font-semibold tracking-[-0.02em] text-ink sm:mt-3 sm:text-[20px] md:text-[22px]">
                  {point.title}
                </h3>
                <p className="mt-2 max-w-[320px] text-[14px] leading-relaxed text-muted md:text-[15px]">
                  {point.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
