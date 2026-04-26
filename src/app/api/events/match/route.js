import { NextResponse } from "next/server";
import { findMatchingEvents, normalizeBusinessForEvents } from "@/lib/events/eventAgent";

export async function POST(req) {
  try {
    const { business } = await req.json();
    const profile = normalizeBusinessForEvents(business || {});
    const events = await findMatchingEvents(business || {}, 12);
    return NextResponse.json({ events, profile });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
