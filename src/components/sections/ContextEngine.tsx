import { FileText, Hash, Sparkles } from "lucide-react";

function WindowChrome({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-bg-border bg-white shadow-[0_18px_48px_rgba(26,26,26,0.08)]">
      <div className="flex items-center gap-1.5 border-b border-bg-line bg-bg-soft px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[#e8b4a8]" />
        <span className="h-2 w-2 rounded-full bg-[#e6d59a]" />
        <span className="h-2 w-2 rounded-full bg-[#b8d4a8]" />
        <span className="ml-2 truncate font-switzer text-[11px] font-medium text-muted">
          {title}
        </span>
      </div>
      <div className="bg-[linear-gradient(180deg,#faf8f6_0%,#ffffff_48%)] p-3.5 md:p-4">
        {children}
      </div>
    </div>
  );
}

function NotesPreview() {
  return (
    <WindowChrome title="ValleyNote · Meeting notes">
      <div className="flex min-h-[220px] flex-col gap-3 py-1">
        <div>
          <h4 className="font-inter-tight text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Meeting notes – Product sync
          </h4>
          <p className="mt-1.5 font-switzer text-[11.5px] leading-relaxed text-muted">
            We decided to ship Ask AI this week and auto-tag research notes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { name: "meetings", color: "#3745f1" },
            { name: "product", color: "#2f7a3e" },
            { name: "launch", color: "#b45309" },
          ].map((tag) => (
            <span
              key={tag.name}
              className="rounded-full px-2 py-0.5 font-switzer text-[10.5px] font-medium"
              style={{
                background: `${tag.color}18`,
                color: tag.color,
              }}
            >
              #{tag.name}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-bg-border px-2 py-0.5 font-switzer text-[10.5px] font-medium text-muted">
            <Hash size={10} strokeWidth={1.85} />
            Add tag
          </span>
        </div>
        <div className="mt-auto rounded-[12px] border border-blue/15 bg-blue/[0.05] px-2.5 py-2">
          <p className="inline-flex items-center gap-1.5 font-switzer text-[11px] font-medium text-blue">
            <Sparkles size={11} strokeWidth={1.85} />
            Suggested tags ready
          </p>
        </div>
      </div>
    </WindowChrome>
  );
}

function SummaryPreview() {
  return (
    <WindowChrome title="ValleyNote · Note editor">
      <div className="flex min-h-[220px] flex-col gap-3 py-1">
        <div>
          <h4 className="font-inter-tight text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Research brief
          </h4>
          <p className="mt-1.5 line-clamp-2 font-switzer text-[11.5px] leading-relaxed text-muted">
            Long draft with findings, quotes, and open questions from the week…
          </p>
        </div>
        <div className="rounded-[14px] border border-blue/20 bg-gradient-to-br from-blue/[0.06] to-white px-3 py-2.5 shadow-[0_8px_18px_rgba(55,69,241,0.05)]">
          <div className="flex items-center justify-between gap-2">
            <p className="font-inter-tight text-[12px] font-semibold text-blue">
              Summary
            </p>
            <span className="font-switzer text-[10px] text-muted">Dismiss</span>
          </div>
          <p className="mt-1.5 font-switzer text-[11.5px] leading-relaxed text-ink">
            Ship Ask AI this week. Keep Pro at $8/mo. Auto-tag research notes.
          </p>
          <span className="mt-2.5 inline-flex rounded-full bg-blue px-2.5 py-1 font-switzer text-[10.5px] font-medium text-white">
            Insert at top
          </span>
        </div>
      </div>
    </WindowChrome>
  );
}

function DigestPreview() {
  return (
    <WindowChrome title="ValleyNote · Organize">
      <div className="flex min-h-[220px] flex-col gap-3 py-1">
        <div>
          <p className="font-switzer text-[11px] font-semibold uppercase tracking-[0.08em] text-blue">
            Organize
          </p>
          <p className="mt-0.5 font-switzer text-[11.5px] text-muted">
            Title, tags, tasks, and related notes without leaving the page.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Auto-tag", "Summarize", "Find related"].map((action) => (
            <span
              key={action}
              className="rounded-full border border-bg-border bg-white px-2 py-0.5 font-switzer text-[10.5px] font-medium text-ink"
            >
              {action}
            </span>
          ))}
        </div>
        <div className="mt-1 border-t border-bg-line/80 pt-2.5">
          <p className="font-switzer text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">
            Related
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {[
              "Pricing notes",
              "Launch checklist",
              "Weekly digest · Oct 24",
            ].map((title) => (
              <span
                key={title}
                className="inline-flex items-center gap-1.5 rounded-full border border-bg-border bg-white px-2.5 py-1 font-switzer text-[11px] text-ink"
              >
                <FileText size={11} strokeWidth={1.85} className="text-blue" />
                {title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

const cards = [
  {
    label: "Notes",
    title: "Auto-tag as you write",
    description:
      "ValleyNote suggests tags and notebooks so meeting notes, research, and study guides stay tidy.",
    Preview: NotesPreview,
  },
  {
    label: "Summary",
    title: "One-click summaries",
    description:
      "Collapse long notes into a clear brief, then keep the full draft right next to it.",
    Preview: SummaryPreview,
  },
  {
    label: "Digest",
    title: "Related notes & digests",
    description:
      "Surface connections across notebooks and get weekly digests of what matters.",
    Preview: DigestPreview,
  },
];

export default function ContextEngine() {
  return (
    <section id="context" className="scroll-mt-28 font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[1140px]">
          <div className="flex flex-col gap-3 border-b border-dashed border-bg-border pb-7 sm:gap-4 sm:pb-8 md:flex-row md:items-end md:justify-between md:gap-10 md:pb-10">
            <div className="max-w-[560px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-blue">
                Organize
              </p>
              <h2 className="mt-3 font-inter-tight text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px] md:text-[44px] md:leading-[1.12]">
                Your library stays organized for you
              </h2>
            </div>
            <p className="max-w-[360px] text-[14px] leading-relaxed text-muted sm:text-[15px] md:pb-1 md:text-[16px]">
              Auto-tags, summaries, and related notes keep every notebook easy to
              find without the manual filing.
            </p>
          </div>

          <div className="mt-2 grid gap-0 border-b border-dashed border-bg-border md:grid-cols-3">
            {cards.map((card, index) => (
              <article
                key={card.title}
                className={`flex flex-col border-b border-dashed border-bg-border px-0 py-7 last:border-b-0 sm:py-8 md:border-b-0 md:px-5 md:py-10 ${
                  index > 0 ? "md:border-l md:border-dashed md:border-bg-border" : ""
                }`}
              >
                <div className="mx-auto w-full max-w-[320px] [mask-image:linear-gradient(to_bottom,black_78%,transparent_100%)]">
                  <card.Preview />
                </div>

                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue sm:mt-6">
                  {card.label}
                </p>
                <h3 className="mt-2 font-inter-tight text-[19px] font-semibold tracking-[-0.02em] text-ink sm:mt-3 sm:text-[20px] md:text-[22px]">
                  {card.title}
                </h3>
                <p className="mt-2 max-w-[320px] text-[14px] leading-relaxed text-muted md:text-[15px]">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
