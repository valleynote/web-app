import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ContactDetailsSection from "@/components/sections/ContactDetailsSection";
import ContactFormSection from "@/components/sections/ContactFormSection";

export const metadata = {
  title: "Contact — ValleyNote",
  description:
    "Get in touch with the ValleyNote team at Moonlight Valley LLC. Ask about plans, privacy, or getting started with your AI notebook.",
};

export default function ContactPage() {
  return (
    <div className="marketing flex min-h-full flex-col overflow-x-clip bg-bg">
      <Header />
      <main className="flex flex-1 flex-col gap-14 pb-14 pt-12 sm:gap-20 sm:pb-20 sm:pt-16 md:gap-28 md:pb-28 md:pt-20">
        <ContactFormSection />
        <ContactDetailsSection />
      </main>
      <Footer />
    </div>
  );
}
