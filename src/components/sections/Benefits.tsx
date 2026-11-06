import {
  BookOpen,
  ListTodo,
  Lock,
  PenLine,
  type LucideIcon,
} from "lucide-react";

const benefits: {
  title: string;
  description: string;
  Icon: LucideIcon;
  Preview: () => React.ReactNode;
}[] = [
  {
    title: "Writing assistant",
    description:
      "Rewrite, expand, shorten, fix grammar, or change tone inline without switching tools.",
    Icon: PenLine,
    Preview: WritingPreview,
  },
  {
    title: "Meetings → to-dos",
    description:
      "Turn meeting notes into action items, then keep tasks next to the notes that created them.",
    Icon: ListTodo,
    Preview: TodosPreview,
  },
  {
    title: "Study & research ready",
    description:
      "Summarize lectures, build study guides, and find related notes across notebooks.",
    Icon: BookOpen,
    Preview: StudyPreview,
  },
  {
    title: "Private by design",
    description:
      "Your notes stay in your account. We do not sell your content or use it to train public models.",
    Icon: Lock,
    Preview: PrivacyPreview,
  },
];

function WritingPreview() {
  return (
    <div className="space-y-3 p-5 md:p-6">
      <p className="font-switzer text-[13px] leading-relaxed text-ink">
        Ship Ask AI this week and keep the pricing simple for creators.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {["Rewrite", "Shorten", "Expand", "Fix grammar"].map((action) => (
          <span
            key={action}
            className="rounded-full border border-bg-border bg-white px-2.5 py-1 font-switzer text-[11px] font-medium text-ink"
          >
            {action}
          </span>
        ))}
      </div>
      <div className="rounded-[14px] border border-blue/20 bg-blue/[0.05] px-3 py-2.5">
        <p className="font-switzer text-[11px] font-semibold uppercase tracking-[0.06em] text-blue">
          Suggested rewrite
        </p>
        <p className="mt-1.5 font-switzer text-[12.5px] leading-relaxed text-ink">
          Launch Ask AI this week with clear, creator-friendly pricing.
        </p>
      </div>
    </div>
  );
}

function TodosPreview() {
  return (
    <div className="space-y-3 p-5 md:p-6">
      <p className="font-inter-tight text-[15px] font-semibold tracking-[-0.02em] text-ink">
        Product sync
      </p>
      <div className="space-y-2">
        {[
          "Ship Ask AI this week",
          "Confirm Pro at $8/mo",
          "Auto-tag research notes",
        ].map((item) => (
          <div
            key={item}
            className="flex items-center gap-2.5 rounded-[12px] border border-bg-border bg-white px-3 py-2"
          >
            <span className="h-3.5 w-3.5 rounded border border-bg-border" />
            <span className="font-switzer text-[12.5px] text-ink">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudyPreview() {
  return (
    <div className="space-y-3 p-5 md:p-6">
      <div className="rounded-[14px] border border-blue/20 bg-gradient-to-br from-blue/[0.06] to-white px-3 py-2.5">
        <p className="font-inter-tight text-[12px] font-semibold text-blue">
          Summary
        </p>
        <p className="mt-1.5 font-switzer text-[12.5px] leading-relaxed text-ink">
          Three themes: launch timing, pricing, and note auto-tags.
        </p>
      </div>
      <div>
        <p className="font-switzer text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">
          Related
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Lecture 4", "Study guide", "Research brief"].map((title) => (
            <span
              key={title}
              className="rounded-full border border-bg-border bg-white px-2.5 py-1 font-switzer text-[11px] text-ink"
            >
              {title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrivacyPreview() {
  return (
    <div className="flex h-full min-h-[180px] flex-col justify-center gap-3 p-5 md:p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 text-blue">
        <Lock size={18} strokeWidth={1.85} />
      </div>
      <p className="font-inter-tight text-[15px] font-semibold tracking-[-0.02em] text-ink">
        Your notebooks stay yours
      </p>
      <p className="max-w-[280px] font-switzer text-[12.5px] leading-relaxed text-muted">
        Notes live in your account. No selling content. No training public
        models on your writing.
      </p>
    </div>
  );
}

export default function Benefits() {
  return (
    <section id="benefits" className="scroll-mt-28 py-16 md:py-24 font-switzer">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <h2 className="max-w-[720px] font-inter-tight text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink md:text-[44px]">
          Built for how you actually take notes
        </h2>
        <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-muted md:text-[16px]">
          From first draft to follow-up tasks, ValleyNote keeps writing, search,
          and AI in one calm workspace.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:mt-14 lg:gap-8">
          {benefits.map((item) => {
            const Icon = item.Icon;
            return (
              <article
                key={item.title}
                className="group overflow-hidden rounded-[24px] border border-bg-border bg-white shadow-[0_20px_60px_rgba(26,26,26,0.06)] transition hover:shadow-[0_24px_70px_rgba(55,69,241,0.12)]"
              >
                <div className="min-h-[200px] border-b border-dashed border-bg-border bg-[linear-gradient(180deg,#faf8f6_0%,#ffffff_55%)]">
                  <item.Preview />
                </div>
                <div className="p-6 md:p-7">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
                      <Icon size={16} strokeWidth={1.85} />
                    </span>
                    <div>
                      <h3 className="font-inter-tight text-[20px] font-semibold tracking-[-0.02em] text-ink md:text-[22px]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-muted md:text-[15px]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
