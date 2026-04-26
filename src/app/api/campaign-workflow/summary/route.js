import { NextResponse } from "next/server";

const MODEL = "gemini-2.0-flash";

export async function POST(req) {
  const { campaign } = await req.json();
  const key = process.env.GEMINI_API_KEY;
  const fallback = `Campaign "${campaign?.title || "Collaboration"}" completed. Deliverable: ${campaign?.submittedContent || "N/A"}.`;

  if (!key) {
    return NextResponse.json({ summary: fallback });
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Write a 3-4 sentence executive summary for the business owner about this completed influencer campaign. Plain text only.\n${JSON.stringify(campaign)}`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.5, maxOutputTokens: 400 },
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || fallback;
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ summary: fallback });
  }
}
