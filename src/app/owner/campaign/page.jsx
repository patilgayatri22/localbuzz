import Sidebar from "@/components/owner/Sidebar";
import CampaignSender from "@/components/owner/CampaignSender";
import { demoBusiness } from "@/lib/demoData";

export default function CampaignPage() {
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <main>
        <CampaignSender business={demoBusiness} />
      </main>
    </div>
  );
}
