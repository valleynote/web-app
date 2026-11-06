import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ContactFormSection from "@/components/sections/ContactFormSection";

export const metadata = {
  title: "Contact — ValleyNote",
  description:
    "Get in touch with the ValleyNote team at Moonlight Valley LLC. Ask about plans, privacy, or getting started with your AI notebook.",
};

export default function ContactPage() {
  return (
    <div className="marketing flex min-h-full flex-col bg-bg">
      <Header />
      <main className="flex flex-1 flex-col pb-16 md:pb-24">
        <ContactFormSection />
      </main>
      <Footer />
    </div>
  );
}
