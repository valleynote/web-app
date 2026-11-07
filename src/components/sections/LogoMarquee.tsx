const capabilities = [
  "Smart editor",
  "Ask my notes",
  "Semantic search",
  "One-click summaries",
  "Rewrite & expand",
  "Auto-tags",
  "Meeting → tasks",
  "Voice notes",
  "Related notes",
  "Version history",
];

export default function LogoMarquee() {
  const row = [...capabilities, ...capabilities];

  return (
    <section className="relative overflow-hidden bg-bg py-8 md:py-10">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent md:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent md:w-28" />

      <div className="marquee items-center gap-3 px-4 md:gap-4">
        {row.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="inline-flex shrink-0 items-center rounded-full border border-bg-border bg-white px-4 py-2 font-switzer text-[13px] font-medium text-ink shadow-[0_8px_24px_rgba(26,26,26,0.04)] md:text-[14px]"
          >
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue" aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
