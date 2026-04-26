import { NextResponse } from "next/server";

const MODEL = "gemini-2.0-flash";

function currentSeason(month) {
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}

function fallbackSuggestions(business, now = new Date()) {
  const month = now.getMonth();
  const season = currentSeason(month);
  const type = (business?.business_type || "local business").toLowerCase();
  const isWellness = /(wellness|health|spa|yoga|fitness)/i.test(type);
  const year = now.getFullYear();

  const offers = [
    {
      id: "seasonal_offer",
      title: `${season} Reset Offer`,
      window: `${season} ${year}`,
      reason: `Seasonal campaigns convert well because customers are already planning ${season.toLowerCase()} routines.`,
      subject: `${season} special from ${business?.business_name || "your local business"}`,
      body: `This ${season.toLowerCase()}, enjoy 15% off your next visit. Book this week to claim your limited-time ${season.toLowerCase()} offer.`,
      channelHint: "Email blast + Instagram story",
    },
  ];

  if (isWellness) {
    offers.unshift({
      id: "international_yoga_day",
      title: "International Yoga Day Campaign",
      window: "June 21",
      reason: "Yoga Day has strong intent for wellness audiences and is ideal for class-pass promos.",
      subject: "Yoga Day week: complimentary class + limited package offer",
      body: "International Yoga Day is coming! Join us this week for one complimentary class, and get a special discount on class packs when you bring a friend.",
      channelHint: "Email + WhatsApp reminder + creator collab reel",
    });
  }

  offers.push({
    id: "next_month_offer",
    title: "Early Next-Month Offer",
    window: "Next 2-3 weeks",
    reason: "Pre-selling the upcoming month helps smooth bookings and improves repeat visits.",
    subject: "Early access: next month’s member offer",
    body: "Early access is now open for next month. Reserve now and get bonus value added to your booking before spots fill.",
    channelHint: "Email first, then follow-up SMS",
  });

  return offers.slice(0, 3);
}

function sanitizeSuggestions(raw, fallback) {
  if (!Array.isArray(raw) || !raw.length) return fallback;
  const cleaned = raw
    .slice(0, 5)
    .map((s, i) => ({
      id: typeof s?.id === "string" ? s.id : `ai_${i + 1}`,
      title: typeof s?.title === "string" ? s.title : "",
      window: typeof s?.window === "string" ? s.window : "",
      reason: typeof s?.reason === "string" ? s.reason : "",
      subject: typeof s?.subject === "string" ? s.subject : "",
      body: typeof s?.body === "string" ? s.body : "",
      channelHint: typeof s?.channelHint === "string" ? s.channelHint : "",
    }))
    .filter((s) => s.title && s.subject && s.body);
  return cleaned.length ? cleaned.slice(0, 3) : fallback;
}

export async function POST(req) {
  const { business } = await req.json();
  const fallback = fallbackSuggestions(business, new Date());
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return NextResponse.json({ suggestions: fallback, source: "fallback" });
  }

  const now = new Date();
  const system = `You are a lifecycle marketing strategist for local businesses.
Return ONLY JSON array with 3 objects:
[
  {
    "id": "short_snake_case",
    "title": "campaign title",
    "window": "date or date range",
    "reason": "why this timing fits the calendar",
    "subject": "email subject line",
    "body": "short offer body (2-3 sentences)",
    "channelHint": "best channel mix"
  }
]
Rules:
- Must be calendar-aware and upcoming, never random.
- Use the real current date context: ${now.toISOString()}.
- Include at least one season-based campaign and one event/day-based campaign relevant to business type.
- If business is wellness/health/yoga/spa, include International Yoga Day timing when relevant (June 21 season).
- Keep offers realistic for a local SMB.
- Avoid fake discounts that sound spammy.
Business:
name=${business?.business_name || "Local business"}
type=${business?.business_type || "Local"}
location=${business?.location || ""}
neighborhood=${business?.neighborhood || ""}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: "Generate 3 campaign suggestions now." }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 1400, responseMimeType: "application/json" },
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return NextResponse.json({ suggestions: sanitizeSuggestions(parsed, fallback), source: "gemini" });
  } catch {
    return NextResponse.json({ suggestions: fallback, source: "fallback" });
  }
}
