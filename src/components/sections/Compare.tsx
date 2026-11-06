import Image from "next/image";
import { assets } from "@/lib/assets";
import { IconCheck } from "@/components/Icons";

const features = [
  "Ask my notes with cited sources",
  "Semantic search across notebooks",
  "Summarize, rewrite, expand, and fix grammar",
  "Auto-tags and related notes",
  "Meeting notes → action items",
  "Voice notes and transcription",
  "Version history on every note",
  "Export to Markdown and plain text",
];

export default function Compare() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <h2 className="font-[family-name:var(--font-inter-tight)] text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink md:text-[44px]">
              More than a notes app—an AI notebook
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-[16px]">
              ValleyNote keeps the calm notebook feel, then adds search, writing
              help, and answers grounded in what you wrote.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
                    <IconCheck size={14} />
                  </span>
                  <span className="text-[14px] font-medium text-ink-soft md:text-[15px]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-bg-border bg-bg-muted shadow-[0_20px_60px_rgba(26,26,26,0.06)]">
            <Image
              src={assets.compare}
              alt="ValleyNote compared to basic notes apps"
              width={1140}
              height={480}
              className="h-auto w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 540px"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
