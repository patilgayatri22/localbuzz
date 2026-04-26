import { generateReplicateImageUrl } from "@/lib/replicateImage";

export const maxDuration = 120;

export async function POST(request) {
  if (!process.env.REPLICATE_API_TOKEN?.trim()) {
    return Response.json({ error: "Replicate is not configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > 4000) {
    return Response.json({ error: "prompt must be a non-empty string under 4000 characters" }, { status: 400 });
  }

  try {
    const url = await generateReplicateImageUrl(prompt);
    if (!url) {
      return Response.json({ error: "Model returned no image URL" }, { status: 502 });
    }
    return Response.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Image generation failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
