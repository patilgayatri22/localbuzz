import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req) {
  const { phones = [], message } = await req.json();
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE;

  if (!sid || !token || !from) {
    return NextResponse.json({
      ok: true,
      mock: true,
      delivered: phones.length,
    });
  }

  try {
    const client = twilio(sid, token);
    const results = await Promise.all(
      phones.map((phone) =>
        client.messages.create({
          body: message,
          from,
          to: phone,
        })
      )
    );
    return NextResponse.json({ ok: true, results, delivered: phones.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
