import { NextResponse } from "next/server";

export async function POST(req) {
  const { bufferToken, profileId, caption, imageUrl } = await req.json();

  if (!bufferToken || !profileId) {
    return NextResponse.json({
      ok: true,
      mock: true,
      message: "Buffer token/profile missing. Simulated successful post.",
    });
  }

  try {
    const response = await fetch("https://api.bufferapp.com/1/updates/create.json", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bufferToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile_ids: [profileId],
        text: caption,
        media: { photo: imageUrl },
      }),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.ok ? 200 : 500 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
