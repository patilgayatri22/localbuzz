import { getAllCampaigns, upsertCampaign } from "@/lib/campaignStorage";
import { STATUS } from "@/lib/campaignWorkflow";
import { demoBusiness } from "@/lib/demoData";

function hasCampaign(id) {
  return getAllCampaigns().some((c) => c.id === id);
}

/** Two sample collaboration rows for the wellness demo owner inbox. */
export function ensureSampleCollaborationCampaignsForEmail(ownerEmail) {
  if (typeof window === "undefined" || !ownerEmail) return;
  const now = new Date();
  const nowIso = now.toISOString();

  const base = {
    businessEmail: ownerEmail,
    businessName: demoBusiness.business_name,
    businessType: demoBusiness.business_type,
    location: demoBusiness.location,
    neighborhood: demoBusiness.neighborhood,
    goals: "Drive bookings for our spring reset package.",
    campaignType: "awareness",
    budget: "$300–$500",
    brief: {
      title: "Spring wellness push",
      summary: "Short-form video + stories highlighting a real first-time visit and how members feel after.",
      objectives: ["Awareness", "Trust", "Bookings"],
    },
    createdAt: nowIso,
    updatedAt: nowIso,
    timeline: [],
    approvals: {},
  };

  if (!hasCampaign("sample_camp_wellness_1")) {
    upsertCampaign({
      ...base,
      id: "sample_camp_wellness_1",
      title: "Spring reset — Reel with Sofia",
      influencerId: "creator_1",
      influencerName: "Sofia Martinez",
      influencerHandle: "@sofia.oakland.beauty",
      status: STATUS.SENT_TO_INFLUENCER,
      dueAt: new Date(Date.now() + 10 * 86400000).toISOString(),
      timeline: [
        { at: nowIso, label: "Sample campaign — request sent (demo)", actor: "business" },
        { at: nowIso, label: "Awaiting influencer response", actor: "system" },
      ],
    });
  }

  if (!hasCampaign("sample_camp_wellness_2")) {
    upsertCampaign({
      ...base,
      id: "sample_camp_wellness_2",
      title: "Mindful movement week — Jenny",
      influencerId: "creator_2",
      influencerName: "Jenny Tran",
      influencerHandle: "@jennytran.bayareaeats",
      status: STATUS.ACTIVE,
      dueAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      suggestedPlan: {
        suggestedPriceUsd: 175,
        priceRationale: "Demo plan — adjust in real workflow.",
        deliverables: [
          { type: "Reel", quantity: 1, description: "60s studio tour + class teaser" },
          { type: "Stories", quantity: 3, description: "Poll + link sticker to book" },
        ],
        revisionRounds: 1,
        usageRights: "30-day repost",
        paymentTerms: "Demo only",
      },
      timeline: [
        { at: nowIso, label: "Sample campaign — active (demo)", actor: "system" },
        { at: nowIso, label: "Deliverable window open", actor: "system" },
      ],
    });
  }

  // Add an overdue campaign only for existing demo users as a reminder test record.
  if (!hasCampaign("sample_camp_wellness_3")) {
    const past1 = new Date(now.getTime() - 5 * 86400000).toISOString();
    const past2 = new Date(now.getTime() - 3 * 86400000).toISOString();
    const overdueAt = new Date(now.getTime() - 2 * 86400000).toISOString();
    upsertCampaign({
      ...base,
      id: "sample_camp_wellness_3",
      title: "Weekend recharge — overdue post follow-up",
      influencerId: "creator_3",
      influencerName: "Marcus Lee",
      influencerHandle: "@marcus.bayarealife",
      status: STATUS.ACTIVE,
      dueAt: overdueAt,
      suggestedPlan: {
        suggestedPriceUsd: 190,
        priceRationale: "Approved demo plan with post deadline already passed.",
        deliverables: [
          { type: "Reel", quantity: 1, description: "45-60s studio experience walkthrough + CTA" },
          { type: "Stories", quantity: 2, description: "Reminder story + booking sticker" },
        ],
        revisionRounds: 1,
        usageRights: "30-day repost",
        paymentTerms: "Demo only",
      },
      timeline: [
        { at: past1, label: "Sample campaign — active (demo)", actor: "system" },
        { at: past2, label: "Deliverable due date set", actor: "system" },
        { at: overdueAt, label: "Deadline passed — awaiting influencer post", actor: "system" },
      ],
    });
  }
}
