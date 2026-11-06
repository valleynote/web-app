type IntegrationItem = {
  name: string;
  hint: string;
  comingSoon?: boolean;
};

const integrations: IntegrationItem[] = [
  { name: "Markdown", hint: ".md files" },
  { name: "Plain text", hint: ".txt files" },
  { name: "Notion", hint: "Import pages", comingSoon: true },
  { name: "Google Docs", hint: "Import docs", comingSoon: true },
  { name: "Evernote", hint: "Import notes", comingSoon: true },
];

export default function Integrations() {
  return (
    <section id="integrations" className="scroll-mt-28 py-16 md:py-24 font-switzer">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <h2 className="max-w-[640px] font-inter-tight text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink md:text-[44px]">
          Import what you already have
        </h2>
        <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-muted md:text-[16px]">
          Bring Markdown and plain text into ValleyNote today. Notion, Docs, and
          more connectors are coming soon.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-14 md:gap-5 lg:grid-cols-5">
          {integrations.map((item) => (
            <div
              key={item.name}
              className={`relative flex min-h-[100px] flex-col items-center justify-center rounded-[20px] border border-bg-border bg-white px-4 py-6 shadow-[0_12px_40px_rgba(26,26,26,0.05)] ${
                item.comingSoon ? "opacity-90" : ""
              }`}
            >
              {item.comingSoon && (
                <span className="absolute right-3 top-3 rounded-full bg-bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-3">
                  Coming soon
                </span>
              )}
              <p className="font-inter-tight text-[16px] font-semibold tracking-[-0.02em] text-ink">
                {item.name}
              </p>
              <p className="mt-1 font-switzer text-[12px] text-muted">{item.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
