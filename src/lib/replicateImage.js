import Replicate from "replicate";
import { buildBuzzStyledImagePrompt } from "@/lib/pollinationsAPI";

const REPLICATE_MAX_BASE = 1400;

function extractFirstImageUrl(output) {
  if (!output) return null;
  const first = Array.isArray(output) ? output[0] : output;
  if (typeof first === "string" && /^https?:\/\//i.test(first)) return first;
  if (first && typeof first.url === "function") {
    try {
      return first.url();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Runs the configured Replicate image model server-side.
 * @param {string} promptBase — Buzz imagePrompt or fallback (no style suffix required).
 * @returns {Promise<string|null>} Public image URL or null on failure.
 */
export async function generateReplicateImageUrl(promptBase) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  const model = process.env.REPLICATE_IMAGE_MODEL || "black-forest-labs/flux-schnell";
  const fullPrompt = buildBuzzStyledImagePrompt(promptBase, REPLICATE_MAX_BASE).slice(0, 2000);

  const replicate = new Replicate({ auth: token });
  const output = await replicate.run(model, {
    input: {
      prompt: fullPrompt,
      aspect_ratio: "1:1",
      output_format: "webp",
      output_quality: 85,
    },
  });

  return extractFirstImageUrl(output);
}
