import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  effectiveDate: string;
  children: ReactNode;
};

export default function LegalPageShell({
  eyebrow,
  title,
  description,
  effectiveDate,
  children,
}: LegalPageShellProps) {
  return (
    <div className="marketing flex min-h-full flex-col bg-bg">
      <Header />
      <main className="flex flex-1 flex-col pb-16 md:pb-24">
        <section className="relative px-4 pb-8 pt-12 font-switzer sm:px-6 md:px-[150px] md:pb-10 md:pt-16">
          <div className="mx-auto w-full max-w-[720px]">
            <p className="font-sans text-[12px] font-light uppercase tracking-[0.22em] text-blue">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-inter-tight text-[28px] font-semibold tracking-[-0.03em] text-ink md:text-[36px]">
              {title}
            </h1>
            <p className="mt-3 text-[15px] font-medium leading-relaxed tracking-[-0.02em] text-muted md:text-[16px]">
              {description}
            </p>
            <p className="mt-4 text-[13px] font-medium tracking-[-0.02em] text-muted-3">
              Effective date: {effectiveDate}
            </p>
          </div>
        </section>

        <section className="px-4 font-switzer sm:px-6 md:px-[150px]">
          <div className="mx-auto w-full max-w-[720px] space-y-10 border-t border-bg-border pt-10 md:space-y-12 md:pt-12">
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-inter-tight text-[20px] font-semibold tracking-[-0.03em] text-ink md:text-[22px]">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] font-medium leading-relaxed tracking-[-0.02em] text-muted md:text-[16px] md:leading-7">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-blue">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
