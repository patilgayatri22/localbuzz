import { NextResponse } from "next/server";
import { influencers } from "@/lib/demoData";

function scoreInfluencer(inf, business, campaign) {
  let score = inf.match || 70;
  const budget = String(campaign.budget || "").toLowerCase();
  if (budget.includes("50") && inf.budget?.includes("50")) score += 5;
  if (business?.neighborhood && inf.location?.toLowerCase().includes((business.neighborhood || "").toLowerCase())) score += 8;
  const type = (business?.business_type || "").toLowerCase();
  const nicheMatch = inf.niches?.some((n) => type.includes(n.toLowerCase()) || n.toLowerCase().includes(type.slice(0, 4)));
  if (nicheMatch) score += 10;
  return Math.min(99, score);
}

export async function POST(req) {
  try {
    const { business, campaign } = await req.json();
    const ranked = [...influencers]
      .map((inf) => ({
        ...inf,
        aiRankScore: scoreInfluencer(inf, business || {}, campaign || {}),
        rankReason: `Strong fit for ${business?.business_type || "local"} campaigns in ${inf.location} (${inf.followers?.toLocaleString?.() || inf.followers} followers, ${inf.engagement}% engagement).`,
      }))
      .sort((a, b) => b.aiRankScore - a.aiRankScore);

    return NextResponse.json({ ranked });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
