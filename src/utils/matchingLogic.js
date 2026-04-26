export const computeMatchScore = (businessType, creator) => {
  const normalizedType = businessType.toLowerCase();
  const nicheBonus = creator.niches.some((niche) => normalizedType.includes(niche.toLowerCase()))
    ? 12
    : 0;
  const followerBonus = creator.followers > 10000 ? 6 : 10;
  const engagementBonus = Math.min(Math.round(creator.engagement * 2), 16);
  return Math.min(99, 60 + nicheBonus + followerBonus + engagementBonus);
};
