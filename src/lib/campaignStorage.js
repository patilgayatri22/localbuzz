const KEY = "localbuzz_collab_campaigns";

const parse = (raw, fallback) => {
  try {
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
};

export function getAllCampaigns() {
  if (typeof window === "undefined") return [];
  return parse(localStorage.getItem(KEY), []);
}

export function saveAllCampaigns(list) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getCampaignById(id) {
  return getAllCampaigns().find((c) => c.id === id) || null;
}

export function upsertCampaign(campaign) {
  const all = getAllCampaigns();
  const idx = all.findIndex((c) => c.id === campaign.id);
  if (idx >= 0) all[idx] = campaign;
  else all.unshift(campaign);
  saveAllCampaigns(all);
  return campaign;
}

export function listCampaignsForBusiness(businessEmail) {
  if (!businessEmail) return getAllCampaigns();
  return getAllCampaigns().filter((c) => c.businessEmail?.toLowerCase() === businessEmail.toLowerCase());
}

export function listCampaignsForInfluencer(influencerId) {
  return getAllCampaigns().filter((c) => c.influencerId === influencerId);
}

export function newCampaignId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `camp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
