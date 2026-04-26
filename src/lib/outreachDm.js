import { getOwnerFirstName } from "@/lib/ownerBusinessProfile";

export const CAMPAIGN_TYPES = {
  affiliate: "affiliate",
  paid_collab: "paid_collab",
  hybrid: "hybrid",
  gifting: "gifting",
};

/** Instagram profile URL from @handle */
export function instagramProfileUrl(handle) {
  if (!handle || typeof handle !== "string") return "https://www.instagram.com/";
  const h = handle.trim().replace(/^@/, "");
  return `https://www.instagram.com/${encodeURIComponent(h)}/`;
}

function nicheLine(creator) {
  const n = creator.niches?.filter(Boolean) || [];
  if (!n.length) return "your local content";
  if (n.length === 1) return n[0];
  return `${n[0]} & ${n[1]}`;
}

function offerForCampaign(campaignType, business) {
  const type = (business.business_type || "").toLowerCase();
  const wellness = type.includes("wellness") || type.includes("health") || type.includes("yoga") || type.includes("spa");

  switch (campaignType) {
    case CAMPAIGN_TYPES.affiliate:
      return wellness
        ? "We'd love to offer 15% commission on every class pass or wellness package booked through your audience."
        : "We'd love to offer 15% commission on sales you drive through a simple tracking link.";
    case CAMPAIGN_TYPES.paid_collab:
      return wellness
        ? "We're proposing a paid collaboration: a complimentary guest session plus $120 for one honest reel + stories about your experience."
        : "We're proposing a paid collaboration with a fair flat fee for one authentic reel + stories — happy to align on scope.";
    case CAMPAIGN_TYPES.hybrid:
      return "We're exploring a hybrid package (fee + performance bonus) — details coming soon on LocalBuzz.";
    case CAMPAIGN_TYPES.gifting:
      return "We're piloting product gifting in exchange for authentic posts — more soon on LocalBuzz.";
    default:
      return "We'd love to find a collaboration structure that works for both of us.";
  }
}

/**
 * Personalized Instagram-style DM (no JSON). Uses owner first name + business name from profile.
 */
export function buildOutreachDm(creator, business, campaignType = CAMPAIGN_TYPES.paid_collab) {
  const first = (creator.name || "there").split(/\s+/)[0];
  const company = (business.business_name || "").trim() || "our local business";
  const ownerFirst = getOwnerFirstName(business);
  const intro = ownerFirst ? `I'm ${ownerFirst} at ${company}` : `I'm reaching out from ${company}`;
  const offer = offerForCampaign(campaignType, business);
  const loc = creator.location || "the Bay Area";
  const niches = nicheLine(creator);

  return `Hey ${first}! 👋

Love your content — your ${loc} posts around ${niches} are amazing!

${intro}. ${offer}

Interested? 😊`;
}
