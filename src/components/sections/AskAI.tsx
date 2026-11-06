import {
  ArrowUp,
  Check,
  FileText,
  ListTodo,
  Mic,
  Search,
  Sparkles,
} from "lucide-react";

function WindowChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-bg-border bg-white shadow-[0_18px_48px_rgba(26,26,26,0.08)]">
      <div className="flex items-center gap-1.5 border-b border-bg-line bg-bg-soft px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[#e8b4a8]" />
        <span className="h-2 w-2 rounded-full bg-[#e6d59a]" />
        <span className="h-2 w-2 rounded-full bg-[#b8d4a8]" />
        <span className="ml-2 truncate font-switzer text-[11px] font-medium text-muted">
          ValleyNote · Ask my notes
        </span>
      </div>
      <div className="bg-[linear-gradient(180deg,#faf8f6_0%,#ffffff_48%)] p-3.5 md:p-4">
        {children}
      </div>
    </div>
  );
}

function AskPreview() {
  return (
    <WindowChrome>
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 py-2">
        <h4 className="text-center font-inter-tight text-[17px] font-semibold tracking-[-0.03em] text-ink md:text-[18px]">
          How can I help you today?
        </h4>
        <p className="max-w-[220px] text-center font-switzer text-[11.5px] leading-relaxed text-muted">
          Ask, create, edit, or organize across your notebooks.
        </p>
        <div className="mt-1 w-full rounded-[16px] border border-bg-border bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(26,26,26,0.04)]">
          <p className="font-switzer text-[12.5px] text-muted">
            Ask anything about your notes…
          </p>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue/10 text-blue">
              <Mic size={13} strokeWidth={1.9} />
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue text-white shadow-[0_6px_14px_rgba(55,69,241,0.28)]">
              <ArrowUp size={13} strokeWidth={2.2} />
            </span>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          {[
            { label: "Research", Icon: Search },
            { label: "To-dos", Icon: ListTodo },
            { label: "Summarize", Icon: Sparkles },
          ].map(({ label, Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 font-switzer text-[11px] text-muted"
            >
              <Icon size={11} strokeWidth={1.85} className="text-blue/80" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </WindowChrome>
  );
}

function SourcesPreview() {
  return (
    <WindowChrome>
      <div className="flex min-h-[220px] flex-col gap-3 py-1">
        <div className="ml-auto max-w-[85%] rounded-[14px] bg-blue px-3 py-2 font-switzer text-[12px] leading-relaxed text-white shadow-[0_8px_18px_rgba(55,69,241,0.22)]">
          What did we decide about the launch?
        </div>
        <div className="max-w-[95%] rounded-[14px] border border-bg-border bg-white px-3 py-2.5 shadow-[0_8px_18px_rgba(26,26,26,0.03)]">
          <p className="font-switzer text-[12px] leading-relaxed text-ink">
            You decided to ship Ask AI this week and keep Pro at $8/mo.{" "}
            <span className="text-blue">[1]</span>
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-bg-line pt-2.5">
            {[
              "[1] Product sync — Oct 24",
              "[2] Pricing notes",
            ].map((title) => (
              <span
                key={title}
                className="inline-flex items-center gap-1 rounded-full bg-bg-soft px-2 py-0.5 font-switzer text-[10.5px] font-medium text-blue"
              >
                <FileText size={10} strokeWidth={1.85} />
                {title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

function ActionsPreview() {
  return (
    <WindowChrome>
      <div className="flex min-h-[220px] flex-col gap-3 py-1">
        <div className="ml-auto max-w-[80%] rounded-[14px] bg-blue px-3 py-2 font-switzer text-[12px] leading-relaxed text-white shadow-[0_8px_18px_rgba(55,69,241,0.22)]">
          Summarize yesterday&apos;s meeting and make a to-do list.
        </div>
        <div className="max-w-[95%] rounded-[14px] border border-bg-border bg-white px-3 py-2.5 shadow-[0_8px_18px_rgba(26,26,26,0.03)]">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {["Created note", "Extracted 4 to-dos"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full bg-green/15 px-2 py-0.5 font-switzer text-[10.5px] font-medium text-[#2f7a3e]"
              >
                <Check size={10} strokeWidth={2.2} />
                {label}
              </span>
            ))}
          </div>
          <p className="font-switzer text-[12px] leading-relaxed text-ink">
            Here&apos;s a short summary plus action items from your meeting
            notes.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {["Summarize notes", "Find related", "Make to-dos"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-bg-border bg-bg-soft px-2 py-0.5 font-switzer text-[10.5px] font-medium text-ink"
              >
                {chip}
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
    label: "Ask",
    title: "Ask my notes",
    description:
      "Chat with your notebooks and get answers linked back to the exact notes they came from.",
    Preview: AskPreview,
  },
  {
    label: "Sources",
    title: "Cited answers every time",
    description:
      "ValleyNote retrieves relevant notes, shows context chips, and answers with clear sources.",
    Preview: SourcesPreview,
  },
  {
    label: "Actions",
    title: "Summarize, find, and plan",
    description:
      "One tap for summaries, related notes, to-dos, and follow-ups without leaving Ask.",
    Preview: ActionsPreview,
  },
];

export default function AskAI() {
  return (
    <section id="ask" className="scroll-mt-28 font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[1140px]">
          <div className="flex flex-col gap-3 border-b border-dashed border-bg-border pb-7 sm:gap-4 sm:pb-8 md:flex-row md:items-end md:justify-between md:gap-10 md:pb-10">
            <div className="max-w-[560px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-blue">
                Ask AI
              </p>
              <h2 className="mt-3 font-inter-tight text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px] md:text-[44px] md:leading-[1.12]">
                AI conversations with your notes
              </h2>
            </div>
            <p className="max-w-[360px] text-[14px] leading-relaxed text-muted sm:text-[15px] md:pb-1 md:text-[16px]">
              Ask anything about what you wrote. ValleyNote finds the context,
              answers in plain language, and points you back to the source notes.
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
