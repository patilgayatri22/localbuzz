import { NextResponse } from "next/server";

const MODEL = "gemini-2.0-flash";

function fallbackPlan(business, influencer, campaign) {
  const followers = influencer?.followers || 5000;
  const eng = influencer?.engagement || 4;
  const base = followers > 10000 ? 150 : followers > 5000 ? 100 : 75;
  return {
    suggestedPriceUsd: base,
    priceRationale: `Based on ~${followers.toLocaleString()} followers and ${eng}% engagement in ${influencer?.location || "your market"}.`,
    deliverables: [
      { type: "Instagram Reel", quantity: 1, description: "60–90s authentic feature of the business" },
      { type: "Instagram Story", quantity: 3, description: "CTA + swipe-up or link sticker if available" },
    ],
    revisionRounds: 1,
    usageRights: "30-day organic repost by business on owned channels with credit",
    paymentTerms: "50% on approval, 50% within 7 days of posting (manual mark later)",
  };
}

export async function POST(req) {
  const { business, campaign, influencer, brief } = await req.json();
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return NextResponse.json({ plan: fallbackPlan(business, influencer, campaign) });
  }

  const system = `You suggest fair paid-collaboration plans for micro-influencers and local SMBs.
Return ONLY JSON (no markdown):
{
  "suggestedPriceUsd": number,
  "priceRationale": "string",
  "deliverables": [{ "type": "string", "quantity": number, "description": "string" }],
  "revisionRounds": number,
  "usageRights": "string",
  "paymentTerms": "string"
}
Rules:
- Price must reflect followers, engagement %, niche, city, and business budget hint: ${campaign?.budget || "not specified"}.
- Keep deliverables realistic for a local campaign.
Business: ${business?.business_name} (${business?.business_type}).
Influencer followers: ${influencer?.followers}, engagement: ${influencer?.engagement}%, niches: ${(influencer?.niches || []).join(", ")}.
Brief: ${JSON.stringify(brief || {})}.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: "Generate suggested plan JSON." }] }],
        generationConfig: { temperature: 0.65, maxOutputTokens: 1024, responseMimeType: "application/json" },
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const plan = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ plan: fallbackPlan(business, influencer, campaign) });
  }
}
