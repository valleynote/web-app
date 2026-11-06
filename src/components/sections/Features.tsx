import Image from "next/image";
import { assets } from "@/lib/assets";
import { IconCheck } from "@/components/Icons";

const columns: {
  key: "valley" | "notes" | "notion" | "notebooklm";
  label: string;
  highlight?: boolean;
}[] = [
  { key: "valley", label: "ValleyNote", highlight: true },
  { key: "notes", label: "Apple Notes" },
  { key: "notion", label: "Notion" },
  { key: "notebooklm", label: "NotebookLM" },
];

type ColKey = (typeof columns)[number]["key"];

const rows: {
  label: string;
  values: Record<ColKey, boolean>;
}[] = [
  {
    label: "Ask my notes with cited sources",
    values: { valley: true, notes: false, notion: false, notebooklm: true },
  },
  {
    label: "Semantic search across notebooks",
    values: { valley: true, notes: false, notion: true, notebooklm: true },
  },
  {
    label: "Inline rewrite, summarize & expand",
    values: { valley: true, notes: false, notion: true, notebooklm: true },
  },
  {
    label: "Auto-tags and related notes",
    values: { valley: true, notes: false, notion: false, notebooklm: false },
  },
  {
    label: "Meeting notes → action items",
    values: { valley: true, notes: false, notion: false, notebooklm: false },
  },
  {
    label: "Voice notes and transcription",
    values: { valley: true, notes: true, notion: false, notebooklm: false },
  },
  {
    label: "Version history on every note",
    values: { valley: true, notes: false, notion: true, notebooklm: false },
  },
  {
    label: "Export to Markdown and plain text",
    values: { valley: true, notes: true, notion: true, notebooklm: false },
  },
];

function CellMark({ on, highlight }: { on: boolean; highlight?: boolean }) {
  if (on) {
    return (
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
          highlight ? "bg-blue text-white" : "bg-bg-muted text-muted"
        }`}
      >
        <IconCheck size={14} />
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center text-[15px] font-medium text-muted-3">
      ×
    </span>
  );
}

export default function Features() {
  return (
    <section id="features" className="scroll-mt-28 font-switzer">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-[150px]">
        <div className="mx-auto w-full max-w-[1140px]">
        <div className="max-w-[640px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-blue">
            Features
          </p>
          <h2 className="mt-3 font-inter-tight text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px] md:text-[44px] md:leading-[1.12]">
            Better than a plain notes app
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted sm:mt-4 sm:text-[15px] md:text-[16px]">
            Compare ValleyNote with everyday notes tools for search, writing
            help, and answers grounded in what you wrote.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[16px] border border-bg-border bg-white shadow-[0_16px_50px_rgba(26,26,26,0.05)] sm:rounded-[20px] md:mt-10">
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[640px] border-collapse text-left sm:min-w-[720px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-[1] min-w-[148px] bg-bg-muted/95 px-3 py-3 text-left text-[12px] font-semibold tracking-[-0.01em] text-muted backdrop-blur-sm sm:min-w-[180px] sm:px-5 sm:py-4 sm:text-[13px] md:px-6 md:text-[14px]">
                    AI notebook features
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-4 text-center text-[13px] font-semibold tracking-[-0.01em] md:px-4 md:text-[14px] ${
                        col.highlight
                          ? "bg-white text-ink shadow-[0_0_0_1px_rgba(55,69,241,0.12),0_18px_40px_rgba(55,69,241,0.08)]"
                          : "bg-bg-muted/50 text-muted"
                      }`}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        {col.highlight && (
                          <Image
                            src={assets.logoMark}
                            alt=""
                            width={22}
                            height={22}
                            className="h-[22px] w-[22px]"
                          />
                        )}
                        {col.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-t border-bg-line last:border-b-0"
                  >
                    <td className="sticky left-0 z-[1] bg-white px-3 py-3 text-[12px] font-medium text-ink sm:px-5 sm:py-4 sm:text-[13px] md:px-6 md:text-[14px]">
                      {row.label}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-3 py-4 text-center md:px-4 ${
                          col.highlight
                            ? "bg-white shadow-[0_0_0_1px_rgba(55,69,241,0.08)]"
                            : "bg-bg-muted/20"
                        }`}
                      >
                        <div className="flex justify-center">
                          <CellMark
                            on={row.values[col.key]}
                            highlight={col.highlight}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-2 grid gap-0 sm:grid-cols-3 md:grid-cols-3">
          {[
            {
              value: "Ask + cite",
              label: "Answers linked to your source notes",
            },
            {
              value: "Search meaning",
              label: "Find ideas by intent, not just keywords",
            },
            {
              value: "Write faster",
              label: "Summarize, rewrite, and extract to-dos inline",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 border-b border-bg-line px-0 py-5 last:border-b-0 sm:border-b-0 sm:px-4 sm:py-8 md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <p className="font-inter-tight text-[20px] font-semibold tracking-[-0.03em] text-ink sm:text-[22px] md:text-[26px]">
                {stat.value}
              </p>
              <p className="text-[13px] text-muted sm:text-[14px]">{stat.label}</p>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
