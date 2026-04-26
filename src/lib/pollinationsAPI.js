/** Max base prompt length for Pollinations GET URLs — long prompts often fail in the browser. */
const MAX_PROMPT_CHARS = 260;

export const BUZZ_IMAGE_STYLE_SUFFIX =
  ", professional photography, soft lighting, Instagram aesthetic, no text, no words, no watermark";

/** Full styled prompt (shared with Replicate so both paths look similar). */
export function buildBuzzStyledImagePrompt(prompt, maxBaseChars = MAX_PROMPT_CHARS) {
  const raw = (prompt || "welcoming local business interior").replace(/\s+/g, " ").trim();
  const clipped =
    raw.length > maxBaseChars ? raw.slice(0, maxBaseChars).replace(/[,;.\s]+$/, "") : raw;
  return `${clipped}${BUZZ_IMAGE_STYLE_SUFFIX}`;
}

/** Single Pollinations URL for a detailed prompt (Buzz variations). */
export const pollinationsImageUrl = (prompt) => {
  const styled = buildBuzzStyledImagePrompt(prompt, MAX_PROMPT_CHARS);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(styled)}?width=1024&height=1024&nologo=true`;
};

export const generateImageVariants = (prompt) => {
  const styles = [
    "professional photography",
    "vibrant colorful",
    "minimalist clean",
    "warm cozy atmosphere",
  ];

  return styles.map(
    (style) =>
      `https://image.pollinations.ai/prompt/${encodeURIComponent(
        `${prompt}, ${style}, high quality, Instagram worthy, no text, no watermark`
      )}?width=1080&height=1080&nologo=true`
  );
};
