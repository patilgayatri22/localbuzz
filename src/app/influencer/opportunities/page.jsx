import InfluencerSidebar from "@/components/influencer/InfluencerSidebar";
import OpportunityCard from "@/components/influencer/OpportunityCard";
import { demoBusiness } from "@/lib/demoData";

export default function OpportunitiesPage() {
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
      <InfluencerSidebar />
      <main className="grid gap-4 md:grid-cols-2">
        <OpportunityCard business={demoBusiness} />
        <OpportunityCard business={{ ...demoBusiness, business_name: "Temescal Coffee Co", business_type: "Coffee Shop" }} />
      </main>
    </div>
  );
}
