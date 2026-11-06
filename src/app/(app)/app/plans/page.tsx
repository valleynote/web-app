import AppTopBar from "@/components/app/AppTopBar";
import PricingCards from "@/components/pricing/PricingCards";

export const metadata = {
  title: "Plans — ValleyNote",
};

export default function PlansPage() {
  return (
    <div className="pb-12">
      <AppTopBar
        title="Plans"
        subtitle="Upgrade for more notes, voice, Ask my notes, and agent tools — or contact us for Enterprise."
        hideActions
      />
      <div className="w-full min-w-0 px-4 pt-2 md:px-7">
        <PricingCards variant="app" showComparison />
      </div>
    </div>
  );
}
