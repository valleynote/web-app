import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AboutMission from "@/components/sections/AboutMission";
import TrustSecurity from "@/components/sections/TrustSecurity";

const FinalCTA = dynamic(() => import("@/components/sections/FinalCTA"));

export const metadata = {
  title: "About - ValleyNote",
  description:
    "Learn about ValleyNote and Moonlight Valley LLC, the team building a private AI notebook for students, freelancers, founders, and teams.",
};

export const revalidate = 60;

export default function AboutPage() {
  return (
    <div className="marketing flex min-h-full flex-col overflow-x-clip bg-bg">
      <Header />
      <main className="flex flex-1 flex-col gap-14 pb-14 pt-12 sm:gap-20 sm:pb-20 sm:pt-16 md:gap-28 md:pb-28 md:pt-20">
        <AboutMission />
        <TrustSecurity />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
