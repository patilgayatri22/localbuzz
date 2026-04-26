"use client";

import { useEffect, useState } from "react";
import OutreachChatsDock from "@/components/owner/OutreachChatsDock";
import Sidebar from "@/components/owner/Sidebar";
import InfluencerCard from "@/components/owner/InfluencerCard";
import OutreachCollaborationModal from "@/components/owner/OutreachCollaborationModal";
import { ensureSampleCollaborationCampaignsForEmail } from "@/lib/demoCollabSeed";
import { influencers } from "@/lib/demoData";
import { CAMPAIGN_TYPES } from "@/lib/outreachDm";
import { getOwnerSession } from "@/lib/localAuth";
import { loadMergedOwnerBusiness } from "@/lib/ownerBusinessProfile";
import { ensureSampleOutreachThreads } from "@/lib/outreachSampleSeed";
import { WELLNESS_DEMO_EMAIL } from "@/lib/wellnessDemoSeed";

export default function InfluencersPage() {
  const [business, setBusiness] = useState(null);
  const [ready, setReady] = useState(false);
  const [modalInfluencer, setModalInfluencer] = useState(null);
  const [campaignType, setCampaignType] = useState(CAMPAIGN_TYPES.paid_collab);
  const [chatOpenTick, setChatOpenTick] = useState(0);
  const [chatActiveId, setChatActiveId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const merged = await loadMergedOwnerBusiness();
      if (!cancelled) {
        setBusiness(merged);
        setReady(true);
        ensureSampleOutreachThreads();
        const session = getOwnerSession();
        if (session?.email?.toLowerCase() === WELLNESS_DEMO_EMAIL.toLowerCase()) {
          ensureSampleCollaborationCampaignsForEmail(session.email);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openDm = (creator) => {
    setCampaignType(CAMPAIGN_TYPES.paid_collab);
    setModalInfluencer(creator);
  };

  const handleSendDmToChat = (creatorId) => {
    setChatActiveId(creatorId || null);
    setChatOpenTick((t) => t + 1);
  };

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <main>
        {!ready || !business ? (
          <div className="rounded-2xl bg-white p-8 text-sm text-[#425466] shadow-sm">Loading your profile…</div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-sm text-xs">
              <span className="rounded-full bg-gray-100 px-3 py-1">Niche: All</span>
              <span className="rounded-full bg-gray-100 px-3 py-1">Location: Bay Area</span>
              <span className="rounded-full bg-gray-100 px-3 py-1">Budget: $0–200</span>
              <span className="rounded-full bg-gray-100 px-3 py-1">Followers: 1k+</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {influencers.map((influencer) => (
                <InfluencerCard key={influencer.id} influencer={influencer} onGenerateDm={openDm} />
              ))}
            </div>
          </>
        )}

        <OutreachCollaborationModal
          open={Boolean(modalInfluencer && business)}
          onClose={() => setModalInfluencer(null)}
          influencer={modalInfluencer}
          business={business}
          campaignType={campaignType}
          onCampaignTypeChange={setCampaignType}
          onSendToChat={handleSendDmToChat}
        />
        <OutreachChatsDock openTick={chatOpenTick} initialActiveId={chatActiveId} />
      </main>
    </div>
  );
}
