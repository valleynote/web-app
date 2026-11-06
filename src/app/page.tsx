import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AskAI from "@/components/sections/AskAI";
import ContextEngine from "@/components/sections/ContextEngine";
import CTA from "@/components/sections/CTA";
import FAQ from "@/components/sections/FAQ";
import Features from "@/components/sections/Features";
import FinalCTA from "@/components/sections/FinalCTA";
import Hero from "@/components/sections/Hero";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <div className="marketing flex min-h-full flex-col overflow-x-clip bg-bg">
      <Header />
      <main className="flex flex-1 flex-col gap-14 pb-14 sm:gap-20 sm:pb-20 md:gap-28 md:pb-28">
        <Hero />
        <Features />
        <AskAI />
        <ContextEngine />
        <Pricing />
        <CTA />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
