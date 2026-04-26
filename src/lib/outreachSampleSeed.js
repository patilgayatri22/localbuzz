import { getNegotiationThread, setNegotiationThread } from "@/lib/outreachNegotiationStorage";

const SAMPLES = {
  creator_1: [
    {
      id: "seed_c1_0",
      from: "owner",
      text: "Hey Sofia! Love your Oakland beauty content. We're GreenLeaf Wellness Studio in Berkeley — interested in a paid reel about a first visit? Happy to align on timing.",
      at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "seed_c1_1",
      from: "influencer",
      text: "Thanks for reaching out! What timeline are you thinking for the post?",
      at: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
    },
    {
      id: "seed_c1_2",
      from: "owner",
      text: "Ideally within 3 weeks — we have a spring promo we’d love to time with your reel + stories.",
      at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  creator_2: [
    {
      id: "seed_c2_0",
      from: "owner",
      text: "Hi Jenny — big fan of your Bay Area food finds. We’re a wellness studio launching a “fuel + recover” week with local partners. Open to a collab?",
      at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: "seed_c2_1",
      from: "influencer",
      text: "Sounds fun! Could you share a rough budget range for this collab?",
      at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ],
};

/** Adds demo negotiation threads when a thread is empty (safe to call on every influencers page load). */
export function ensureSampleOutreachThreads() {
  if (typeof window === "undefined") return;
  Object.keys(SAMPLES).forEach((creatorId) => {
    if (getNegotiationThread(creatorId).length > 0) return;
    setNegotiationThread(creatorId, SAMPLES[creatorId]);
  });
}
