import { NextResponse } from "next/server";
import { generateOutreachMessage, normalizeBusinessForEvents } from "@/lib/events/eventAgent";

export async function POST(req) {
  try {
    const { eventRaw, business, outreachType } = await req.json();
    if (!eventRaw) {
      return NextResponse.json({ error: "eventRaw is required" }, { status: 400 });
    }
    const profile = normalizeBusinessForEvents(business || {});
    const message = await generateOutreachMessage(eventRaw, profile, outreachType || "partner");
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
