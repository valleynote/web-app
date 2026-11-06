import Image from "next/image";
import { assets } from "@/lib/assets";

const metricCards = [
  {
    title: "Students",
    description:
      "Lecture notes, study guides, and exam prep—with AI that cites your sources.",
    image: assets.growth,
    featured: true,
  },
  {
    title: "Freelancers",
    description: "Client briefs, invoices, and project logs in one searchable place.",
    image: assets.growth2,
  },
  {
    title: "Founders",
    description: "Strategy memos, investor updates, and product ideas that stay connected.",
    image: assets.growth,
  },
  {
    title: "Researchers",
    description: "Reading notes, hypotheses, and references linked by topic.",
    image: assets.growth2,
  },
  {
    title: "Teams",
    description: "Shared notebooks and tags for handoffs without another wiki tool.",
    image: assets.growth,
  },
];

export default function GrowthMetrics() {
  return (
    <section id="growth" className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <h2 className="max-w-[720px] font-[family-name:var(--font-inter-tight)] text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink md:text-[44px]">
          Made for the way you take notes
        </h2>
        <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-muted md:text-[16px]">
          Whether you are in class, on a client call, or building a company,
          ValleyNote adapts to your workflow.
        </p>

        <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2 lg:grid-cols-3">
          {metricCards.map((card) => (
            <article
              key={card.title}
              className={`overflow-hidden rounded-[24px] border border-bg-border bg-white shadow-[0_20px_60px_rgba(26,26,26,0.06)] ${
                card.featured ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <div
                className={`relative w-full bg-bg-muted ${
                  card.featured ? "aspect-[566/264] max-h-[200px]" : "aspect-[566/264]"
                }`}
              >
                <Image
                  src={card.image}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="border-t border-bg-line p-6 md:p-7">
                <h3 className="font-[family-name:var(--font-inter-tight)] text-[20px] font-semibold tracking-[-0.02em] text-ink md:text-[22px]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted md:text-[15px]">
                  {card.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
