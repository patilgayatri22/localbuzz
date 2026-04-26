const marketingKnowledge = [
  {
    id: "weekend-offer",
    tags: ["weekend", "offer", "promotion", "special", "discount"],
    content:
      "For weekend offers, use urgency and local context: mention limited slots, neighborhood name, and a clear CTA like 'Book now'. Include one measurable benefit (e.g., 15% off or free add-on).",
  },
  {
    id: "beauty-tone",
    tags: ["nail", "salon", "spa", "beauty", "wellness"],
    content:
      "Beauty and wellness brands perform well with confidence-forward tone, sensory words (glow, refresh, unwind), and outcome-first hooks. Keep captions aspirational but friendly.",
  },
  {
    id: "food-tone",
    tags: ["restaurant", "food", "bakery", "coffee", "menu"],
    content:
      "Food campaigns should highlight cravings, timing, and social proof: mention best-seller, limited-time flavor, and nearby landmarks to improve local relevance.",
  },
  {
    id: "email-best-practice",
    tags: ["email", "campaign", "subject", "customers"],
    content:
      "High-performing local email structure: personalized greeting, short body with one offer, one CTA button/link, and a deadline. Subject lines under 50 characters are preferred.",
  },
  {
    id: "whatsapp-sms",
    tags: ["whatsapp", "sms", "text", "message"],
    content:
      "Short-form messaging should be conversational and direct. First line should clearly state the offer, second line should include CTA, and avoid heavy formatting.",
  },
  {
    id: "multilingual",
    tags: ["spanish", "chinese", "vietnamese", "language"],
    content:
      "When writing in another language, keep cultural tone natural and local. Preserve business name and CTA details exactly to avoid customer confusion.",
  },
];

export const retrieveMarketingKnowledge = (message = "", business = {}) => {
  const query = `${message} ${business.business_type || ""} ${business.language || ""}`.toLowerCase();
  return marketingKnowledge
    .map((item) => ({
      ...item,
      score: item.tags.reduce((acc, tag) => (query.includes(tag) ? acc + 1 : acc), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => `- ${item.content}`)
    .join("\n");
};
