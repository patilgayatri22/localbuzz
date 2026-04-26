import { NextResponse } from "next/server";

const MODEL = "gemini-2.0-flash";

function fallbackBrief(business, campaign, influencer) {
  const name = business?.business_name || "Your business";
  return {
    title: campaign.title || "Collaboration campaign",
    summary: `${name} proposes a focused collaboration with ${influencer?.name || "the creator"} to reach local customers.`,
    objectives: [
      "Drive awareness in the neighborhood",
      "Highlight a clear offer or story",
      "Trackable post + optional Stories",
    ],
    keyMessages: ["Local", "Trust", "Quality"],
    timeline: "2 weeks from approval",
    successMetrics: ["Reach", "Saves", "DMs or bookings"],
    brandVoice: business?.tone || "friendly",
  };
}

export async function POST(req) {
  const { business, campaign, influencer } = await req.json();
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return NextResponse.json({ brief: fallbackBrief(business, campaign, influencer) });
  }

  const system = `You write structured campaign briefs for local businesses and creators.
Return ONLY valid JSON (no markdown):
{
  "title": "short internal title",
  "summary": "2-3 sentences",
  "objectives": ["string", "string"],
  "keyMessages": ["string"],
  "timeline": "plain language",
  "successMetrics": ["string"],
  "brandVoice": "one line"
}
Use ONLY this business name: ${business?.business_name || "Business"}.
Business type: ${business?.business_type || "local"}.
Location: ${business?.location || ""} ${business?.neighborhood || ""}.
Campaign: ${JSON.stringify(campaign || {})}.
Influencer: ${JSON.stringify({ name: influencer?.name, handle: influencer?.handle, followers: influencer?.followers, engagement: influencer?.engagement, niches: influencer?.niches })}.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: "Generate the campaign brief JSON." }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024, responseMimeType: "application/json" },
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const brief = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return NextResponse.json({ brief });
  } catch {
    return NextResponse.json({ brief: fallbackBrief(business, campaign, influencer) });
  }
}
