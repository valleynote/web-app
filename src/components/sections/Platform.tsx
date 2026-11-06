import Image from "next/image";
import Link from "next/link";
import { assets } from "@/lib/assets";

const features = [
  {
    title: "Notebooks and tags",
    description: "Group work by project, class, or client without extra clutter.",
  },
  {
    title: "Private by design",
    description:
      "Your notes are yours—we use encryption in transit and at rest, and you control exports.",
  },
  {
    title: "Instant search",
    description:
      "Jump to the right note in seconds with search that understands what you mean.",
  },
];

const benefits = [
  { label: "One home for every note you write" },
  { label: "AI that cites the notes behind each answer" },
  { label: "Start free—upgrade when you need more AI" },
];

export default function Platform() {
  return (
    <section id="platform" className="scroll-mt-28 py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-blue">
              Notebooks
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-inter-tight)] text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink md:text-[44px]">
              Notebooks, tags, and search that keep up
            </h2>
            <p className="mt-4 max-w-[480px] text-[16px] leading-relaxed text-muted md:text-[17px]">
              Group work by project or class, tag as you go, and find anything
              with search that understands meaning.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex rounded-full bg-blue px-6 py-3.5 text-[15px] font-medium text-white shadow-[0_12px_32px_rgba(55,69,241,0.35)] transition hover:bg-blue/90"
            >
              Get started
            </Link>

            <ul className="mt-10 space-y-5">
              {features.map((item) => (
                <li
                  key={item.title}
                  className="rounded-[20px] border border-bg-border bg-white p-5 shadow-[0_8px_30px_rgba(26,26,26,0.05)]"
                >
                  <h3 className="font-[family-name:var(--font-inter-tight)] text-[17px] font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-bg-border bg-white shadow-[0_24px_70px_rgba(26,26,26,0.08)]">
            <Image
              src={assets.platform}
              alt="ValleyNote platform"
              width={1138}
              height={1194}
              className="h-auto w-full"
              sizes="(max-width: 1024px) 100vw, 540px"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-4 rounded-[24px] border border-bg-border bg-bg-soft p-6 md:mt-16 md:grid-cols-3 md:gap-6 md:p-8">
          {benefits.map((item) => (
            <div key={item.label} className="text-center md:text-left">
              <p className="text-[15px] font-medium leading-relaxed text-ink md:text-[16px]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
