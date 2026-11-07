import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";

const Features = dynamic(() => import("@/components/sections/Features"));
const AskAI = dynamic(() => import("@/components/sections/AskAI"));
const ContextEngine = dynamic(() => import("@/components/sections/ContextEngine"));
const Pricing = dynamic(() => import("@/components/sections/Pricing"));
const CTA = dynamic(() => import("@/components/sections/CTA"));
const Testimonials = dynamic(() => import("@/components/sections/Testimonials"));
const FAQ = dynamic(() => import("@/components/sections/FAQ"));
const FinalCTA = dynamic(() => import("@/components/sections/FinalCTA"));

/** Revalidate often so shared caches / fetch tools pick up asset path changes. */
export const revalidate = 60;

export default function Home() {
  return (
    <div className="marketing flex min-h-full flex-col overflow-x-clip bg-bg">
      <Header />
      <main className="flex flex-1 flex-col gap-14 pb-14 sm:gap-20 sm:pb-20 md:gap-28 md:pb-28">
        <Hero />
        <AskAI />
        <Features />
        <ContextEngine />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
