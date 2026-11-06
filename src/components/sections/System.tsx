import Image from "next/image";
import { assets } from "@/lib/assets";

const columns = [
  {
    title: "Notes scattered across apps, impossible to find",
    description:
      "Ideas live in docs, chats, and sticky notes—searching wastes time and context gets lost.",
    image: assets.systemLeft,
    tone: "muted" as const,
  },
  {
    title: "One AI notebook that organizes and answers for you",
    description:
      "ValleyNote keeps writing, tags, and search in one place—and lets you ask questions with cited answers.",
    image: assets.systemRight,
    tone: "accent" as const,
  },
];

export default function System() {
  return (
    <section id="about" className="scroll-mt-28 py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <p className="font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-muted-3">
          Why ValleyNote
        </p>
        <h2 className="mt-3 max-w-[640px] font-[family-name:var(--font-inter-tight)] text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink md:text-[44px]">
          Stop losing ideas across apps
        </h2>

        <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-2 md:gap-8">
          {columns.map((col) => (
            <article
              key={col.title}
              className={`overflow-hidden rounded-[24px] border border-bg-border bg-white shadow-[0_20px_60px_rgba(26,26,26,0.06)] ${
                col.tone === "accent" ? "ring-1 ring-blue/10" : ""
              }`}
            >
              <div className="relative aspect-[1139/790] w-full bg-bg-muted">
                <Image
                  src={col.image}
                  alt=""
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 540px"
                />
              </div>
              <div className="border-t border-bg-line p-6 md:p-8">
                <h3 className="font-[family-name:var(--font-inter-tight)] text-[20px] font-semibold tracking-[-0.02em] text-ink md:text-[22px]">
                  {col.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted md:text-[16px]">
                  {col.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
