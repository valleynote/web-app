import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata = {
  title: "About — ValleyNote",
  description:
    "ValleyNote by Moonlight Valley LLC is an AI-powered notebook for students, freelancers, founders, and teams—write, organize, and ask your notes.",
};

export default function AboutPage() {
  return (
    <div className="marketing flex min-h-full flex-col bg-bg">
      <Header />
      <main className="flex flex-1 flex-col pb-16 md:pb-24">
        <section className="relative px-4 pb-8 pt-12 font-switzer sm:px-6 md:px-[150px] md:pb-10 md:pt-16">
          <div className="mx-auto w-full max-w-[720px]">
            <p className="font-sans text-[12px] font-light uppercase tracking-[0.22em] text-blue">
              About
            </p>
            <h1 className="mt-3 font-inter-tight text-[28px] font-semibold tracking-[-0.03em] text-ink md:text-[36px]">
              About ValleyNote
            </h1>
            <p className="mt-3 text-[15px] font-medium leading-relaxed tracking-[-0.02em] text-muted md:text-[16px]">
              ValleyNote is an AI-powered notebook from Moonlight Valley LLC. It
              helps students, freelancers, founders, and small teams write,
              organize, and ask their own notes—private by design.
            </p>
          </div>
        </section>

        <section className="px-4 font-switzer sm:px-6 md:px-[150px]">
          <div className="mx-auto w-full max-w-[720px] space-y-8 border-t border-bg-border pt-10 text-[15px] font-medium leading-relaxed tracking-[-0.02em] text-muted md:space-y-10 md:pt-12 md:text-[16px] md:leading-7">
            <div>
              <h2 className="font-inter-tight text-[20px] font-semibold tracking-[-0.03em] text-ink md:text-[22px]">
                What we build
              </h2>
              <p className="mt-3">
                Capture ideas in a smart editor, keep notebooks and tags tidy,
                embed images and video, turn voice into text, search by meaning,
                and chat with Ask my notes—answers grounded in your writing, not
                the open web.
              </p>
            </div>
            <div>
              <h2 className="font-inter-tight text-[20px] font-semibold tracking-[-0.03em] text-ink md:text-[22px]">
                Our approach
              </h2>
              <p className="mt-3">
                We believe a notebook should feel calm and stay yours. AI should
                speed up writing and retrieval without selling your content or
                training public models on private notes.
              </p>
            </div>
            <div>
              <h2 className="font-inter-tight text-[20px] font-semibold tracking-[-0.03em] text-ink md:text-[22px]">
                Get in touch
              </h2>
              <p className="mt-3">
                Questions about plans, privacy, or Enterprise?{" "}
                <Link href="/contact" className="text-blue hover:underline">
                  Contact us
                </Link>{" "}
                or email{" "}
                <a
                  href="mailto:hello@valleynote.com"
                  className="text-blue hover:underline"
                >
                  hello@valleynote.com
                </a>
                . Read our{" "}
                <Link href="/terms" className="text-blue hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
