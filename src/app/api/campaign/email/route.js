import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req) {
  const { emails = [], businessName, subject, body } = await req.json();
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    return NextResponse.json({
      ok: true,
      mock: true,
      delivered: emails.length,
    });
  }

  try {
    const resend = new Resend(key);
    const results = await Promise.all(
      emails.map((email) =>
        resend.emails.send({
          from: "campaigns@localbuzz.app",
          to: email,
          subject,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><h2>${businessName}</h2>${body}<p style="color:#999;font-size:12px;">Unsubscribe</p></div>`,
        })
      )
    );
    return NextResponse.json({ ok: true, results, delivered: emails.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
