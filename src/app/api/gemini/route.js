import { NextResponse } from "next/server";
import {
  buildBuzzSystemContext,
  buildBuzzUserMessage,
  buildFallbackBuzz,
  coerceBuzzToCanonical,
  friendlyBuzzIntro,
  normalizeBusinessForBuzz,
  parseBuzzJson,
  validateBuzzPayload,
} from "@/lib/prompts/buzzGemini";

const MODEL = "gemini-2.0-flash";

function pickModelText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((p) => (typeof p?.text === "string" ? p.text : "")).join("");
}

async function requestGemini({ key, systemContext, userPayload, jsonMode = true }) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemContext }] },
      contents: [{ role: "user", parts: [{ text: userPayload }] }],
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 2048,
        ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Gemini request failed");
  }

  const data = await response.json();
  return pickModelText(data);
}

export async function POST(req) {
  const { message, business } = await req.json();
  const profile = normalizeBusinessForBuzz(business || {});
  const systemContext = buildBuzzSystemContext(profile);
  const userPayload = buildBuzzUserMessage(message || "");

  const replyForUser = friendlyBuzzIntro(profile);

  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    const buzz = buildFallbackBuzz(profile, message);
    return NextResponse.json({
      replyText: replyForUser,
      buzz,
    });
  }

  try {
    const rawText = await requestGemini({ key, systemContext, userPayload, jsonMode: true });
    let parsed = parseBuzzJson(rawText);

    // Retry without JSON mime mode when model formatting is malformed.
    if (!validateBuzzPayload(parsed)) {
      const retryRaw = await requestGemini({
        key,
        systemContext,
        userPayload: `${userPayload}\n\nIMPORTANT: Return valid JSON only with the exact schema.`,
        jsonMode: false,
      });
      parsed = parseBuzzJson(retryRaw);
    }

    if (!validateBuzzPayload(parsed)) {
      const buzz = buildFallbackBuzz(profile, message);
      return NextResponse.json({
        replyText: replyForUser,
        buzz,
        source: "fallback_invalid_json",
      });
    }

    const buzz = coerceBuzzToCanonical(parsed, profile, message) || buildFallbackBuzz(profile, message);

    return NextResponse.json({
      replyText: replyForUser,
      buzz,
      source: "gemini",
    });
  } catch (error) {
    const buzz = buildFallbackBuzz(profile, message);
    const errText = error instanceof Error ? error.message : "Gemini request failed";
    return NextResponse.json({
      replyText: replyForUser,
      buzz,
      error: errText,
      source: "fallback_error",
    });
  }
}
