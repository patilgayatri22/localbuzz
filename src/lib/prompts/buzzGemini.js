/**
 * Normalizes client business payload for prompts (Supabase-ready shape).
 */
export function normalizeBusinessForBuzz(business = {}) {
  const name = (business.business_name || business.name || "").trim() || "Your business";
  const type = (business.business_type || business.type || "").trim() || "Local business";
  const rawLoc = business.location || business.city || "";
  const city = String(rawLoc).split(",")[0].trim() || "";
  const region = String(rawLoc).includes(",") ? String(rawLoc).split(",").slice(1).join(",").trim() : "";
  const neighborhood = (business.neighborhood || "").trim();
  const language = (business.language || "English").trim() || "English";
  const tone = (business.tone || "friendly").trim() || "friendly";
  return {
    name,
    type,
    city,
    region,
    neighborhood,
    language,
    tone,
  };
}

export function buildBuzzSystemContext(b) {
  const locationLine = [b.neighborhood, b.city].filter(Boolean).join(", ").trim();
  const regionPart = b.region ? ` (${b.region})` : "";
  const locationBlock = locationLine ? `${locationLine}${regionPart}` : b.region || "Not specified";
  return `
You are Buzz, marketing agent for ${b.name}.
Business type: ${b.type}
Location: ${locationBlock}
Tone: ${b.tone}
Language: ${b.language}

STRICT RULES:
- NEVER mention a different business name. Only reference "${b.name}".
- NEVER assume a different business type. Only use: "${b.type}".
- NEVER invent a city or neighborhood; use only the location details above (or say "our shop" / "our studio" if location is not specified).
- All copy must fit this business and location context.
- Output must be valid JSON only (no markdown fences, no commentary, no prose before or after the JSON).
- Do NOT echo this system block in the user-visible channel; output JSON only.

CONTENT TASK:
The user wants marketing content. Respond with this exact JSON shape:

{
  "variations": [
    {
      "id": 1,
      "angle": "Educational",
      "caption": "value-first Instagram caption, no hashtags inside caption body",
      "hashtags": ["#tag1", "#tag2"],
      "imagePrompt": "English-only visual description for image generation: subject, setting, mood. No text or words in image. Match educational angle: clean, informative feel."
    },
    {
      "id": 2,
      "angle": "Emotional",
      "caption": "warm lifestyle caption, no hashtags inside caption",
      "hashtags": ["#tag1", "#tag2"],
      "imagePrompt": "visual description, no text in image. Match emotional angle: warm lifestyle photography."
    },
    {
      "id": 3,
      "angle": "Action",
      "caption": "offer/CTA-forward caption, no hashtags inside caption",
      "hashtags": ["#tag1", "#tag2"],
      "imagePrompt": "visual description, no text in image. Match action angle: vibrant, eye-catching, energetic."
    }
  ],
  "whatsapp": { "message": "short conversational text" },
  "email": { "subject": "", "body": "", "ctaText": "" },
  "sms": { "message": "under 160 chars if possible; include business name" }
}

CAPTION VARIATIONS:
- Three different angles: Educational, Emotional, Action — each unique angle and hashtag set.
- Instagram captions: strong hook, short paragraphs, clear CTA; put NO hashtags inside caption strings (hashtags array only).
- NEVER paste, quote, or append the user's raw instruction text inside any caption (e.g. do not repeat "give me a post…"); interpret intent only and write finished post copy.
- If language is not English, write captions and other messages in that language.

IMAGE PROMPTS (for Pollinations):
- Append mentally (do not duplicate long phrase): professional photography, soft lighting, Instagram aesthetic, high detail, no text, no words, no watermark, no logos.
- Tailor visuals to business type (e.g., wellness = calm, natural tones, spa-like; restaurant = appetizing scene; retail = product-focused).
`;
}

export function buildBuzzUserMessage(userMessage) {
  return `Owner goal (interpret this; do NOT echo it verbatim inside caption fields):\n${userMessage}\n\nReturn JSON only as specified.`;
}

/** If the model pasted the user's instruction into a caption, strip trailing echo or a duplicate line. */
export function stripEchoedUserInstruction(caption, userMessage) {
  if (!caption || typeof caption !== "string") return caption;
  let out = caption.trim();
  const u = (userMessage || "").trim();
  if (u.length >= 6) {
    const lower = out.toLowerCase();
    const uLower = u.toLowerCase();
    if (lower.endsWith(uLower)) {
      out = out.slice(0, out.length - u.length).replace(/[\s.,;…—-]+$/g, "").trim();
    }
    const lines = out.split(/\n/);
    const filtered = lines.filter((line) => line.trim().toLowerCase() !== uLower);
    if (filtered.length && filtered.join("\n").trim().length > 24) {
      out = filtered.join("\n").trim();
    }
  }
  return out.replace(/\s{2,}/g, " ").trim() || caption.trim();
}

/** Safe parse of model JSON text (handles fences and prose around JSON). */
export function parseBuzzJson(rawText) {
  if (!rawText || typeof rawText !== "string") return null;
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  const tryParse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };
  let out = tryParse(cleaned);
  if (out) return out;
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    out = tryParse(cleaned.slice(start, end + 1));
  }
  return out;
}

export function validateBuzzPayload(parsed) {
  if (!parsed || typeof parsed !== "object") return false;
  if (Array.isArray(parsed.variations) && parsed.variations.length >= 1) return true;
  const ig = parsed.instagram ?? parsed.Instagram;
  if (ig && typeof ig === "object" && (ig.caption || ig.text)) return true;
  if (Array.isArray(parsed.captions) && parsed.captions.length >= 1) return true;
  return false;
}

/** True if a string looks like raw JSON the model wrongly returned as chat text. */
export function replyTextLooksLikeBuzzJson(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.trim();
  if (!t.startsWith("{")) return false;
  return /"variations"\s*:/.test(t) || /"instagram"\s*:/.test(t) || /"caption"\s*:/.test(t);
}

export function friendlyBuzzIntro(b) {
  return `Here are 3 Instagram angles for ${b.name}, plus WhatsApp, email, and SMS drafts. Pick a caption and image on the right.`;
}

/**
 * Maps legacy / partial Gemini shapes into the canonical Buzz payload (3 variations + channels).
 */
export function coerceBuzzToCanonical(parsed, businessNorm, userMessage) {
  if (!parsed || typeof parsed !== "object") return null;
  const fb = buildFallbackBuzz(businessNorm, userMessage);
  let variations = Array.isArray(parsed.variations) ? [...parsed.variations] : [];

  if (variations.length === 0) {
    const ig = parsed.instagram ?? parsed.Instagram;
    if (ig && typeof ig === "object") {
      const cap = (ig.caption || ig.text || ig.body || "").trim();
      const tags =
        Array.isArray(ig.hashtags) ? ig.hashtags : typeof ig.hashtags === "string" ? ig.hashtags.split(/\s+/).filter(Boolean) : [];
      variations = [
        {
          id: 1,
          angle: "Educational",
          caption: cap,
          hashtags: tags.length ? tags : [...fb.variations[0].hashtags],
          imagePrompt: (ig.imagePrompt || "").trim() || fb.variations[0].imagePrompt,
        },
      ];
    }
  }

  if (variations.length === 0 && Array.isArray(parsed.captions) && parsed.captions.length) {
    variations = parsed.captions.slice(0, 3).map((c, i) => {
      const obj = typeof c === "object" && c ? c : {};
      const cap = typeof c === "string" ? c : (obj.caption || obj.text || "").trim();
      return {
        id: i + 1,
        angle: obj.angle || ["Educational", "Emotional", "Action"][i] || "Action",
        caption: cap,
        hashtags: Array.isArray(obj.hashtags) && obj.hashtags.length ? obj.hashtags : fb.variations[i].hashtags,
        imagePrompt: (obj.imagePrompt || "").trim() || fb.variations[i].imagePrompt,
      };
    });
  }

  if (variations.length === 0) return null;

  const angles = ["Educational", "Emotional", "Action"];
  const merged = [0, 1, 2].map((i) => {
    const slot = variations[i] || {};
    const base = fb.variations[i];
    let caption = (slot.caption || "").trim() || base.caption;
    caption = stripEchoedUserInstruction(caption, userMessage);
    const hashtags = Array.isArray(slot.hashtags) && slot.hashtags.length ? slot.hashtags : base.hashtags;
    let imagePrompt = (slot.imagePrompt || "").trim() || base.imagePrompt;
    if (!imagePrompt || imagePrompt.length < 12) {
      imagePrompt = base.imagePrompt;
    }
    const angle = (slot.angle || angles[i] || base.angle).trim() || base.angle;
    return {
      id: i + 1,
      angle,
      caption,
      hashtags,
      imagePrompt,
    };
  });

  const wa = parsed.whatsapp ?? parsed.WhatsApp;
  const whatsappMessage = typeof wa === "string" ? wa : wa?.message ?? fb.whatsapp.message;

  const em = parsed.email ?? parsed.Email ?? {};
  const email =
    typeof em === "object" && em
      ? {
          subject: em.subject || fb.email.subject,
          body: em.body || fb.email.body,
          ctaText: em.ctaText || em.cta || fb.email.ctaText,
        }
      : fb.email;

  const sms = parsed.sms ?? parsed.SMS;
  const smsMessage = typeof sms === "string" ? sms : sms?.message ?? fb.sms.message;

  return {
    variations: merged,
    whatsapp: { message: whatsappMessage },
    email,
    sms: { message: smsMessage },
  };
}

/** Short idea line for channels only — never splice raw meta prompts into Instagram captions. */
function channelContextLine(userMessage, businessNorm) {
  const raw = (userMessage || "").trim();
  if (!raw) return `Ask us what is new at ${businessNorm.name} this week.`;
  const lower = raw.toLowerCase();
  const meta =
    /^(give me|create|generate|make|write|i need|can you|please)\b/i.test(lower) &&
    /(post|caption|instagram|content|image|reel|story)/i.test(lower);
  if (meta || raw.length > 160) {
    return `We have something fresh to share — reply if you want the details.`;
  }
  return raw.slice(0, 140);
}

function promptFlavor(userMessage) {
  const raw = String(userMessage || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const ignore = new Set(["give", "create", "generate", "post", "caption", "instagram", "content", "image", "reel", "story", "make", "this", "that", "with", "from", "your", "about", "local", "business"]);
  const keep = raw.filter((w) => !ignore.has(w));
  return keep.slice(0, 4).join(", ");
}

export function buildFallbackBuzz(businessNorm, userMessage) {
  const { name, type, city } = businessNorm;
  const cityTag = city ? city.replace(/\s+/g, "") : "Local";
  const loc = city || "our community";
  const channelLine = channelContextLine(userMessage, businessNorm);
  const flavor = promptFlavor(userMessage);
  const flavorText = flavor ? ` around ${flavor}` : "";
  const wellness = /wellness|yoga|spa|meditation|pilates|mindful|holistic/i.test(`${type} ${name}`);

  const v1 = wellness
    ? {
        caption: `At ${name}, we love sharing what works${flavorText} — here is one small habit our ${loc} regulars swear by for feeling their best all week.`,
        hashtags: [`#${cityTag}Wellness`, "#HealthyHabits", "#SelfCare"],
        imagePrompt: `${type} bright studio interior plants natural light calm yoga mat water bottle serene mood ${loc}${flavor ? ` theme ${flavor}` : ""} no people no text no logos`,
      }
    : {
        caption: `At ${name}, we love sharing what works${flavorText} — here is a quick tip our ${loc} guests always appreciate when they visit.`,
        hashtags: [`#${cityTag}Business`, "#LocalTips", "#SmallBusiness"],
        imagePrompt: `${type} inviting interior daylight authentic local business ${loc}${flavor ? ` focus ${flavor}` : ""} friendly atmosphere no text no watermark`,
      };

  const v2 = wellness
    ? {
        caption: `Some weeks feel heavier than others. ${name} is here so you can breathe, reset, and leave a little lighter${flavorText} — that is why we do what we do in ${loc}.`,
        hashtags: ["#MindfulMoments", "#CommunityCare", `#${cityTag}`],
        imagePrompt: `${type} warm soft light peaceful relaxation cozy textiles plants serene ${loc} lifestyle${flavor ? ` inspired by ${flavor}` : ""} no faces no text`,
      }
    : {
        caption: `Community means everything to us at ${name}. When you walk through our doors in ${loc}, we want you to feel welcomed and taken care of${flavorText}.`,
        hashtags: ["#Community", "#ShopSmall", `#${cityTag}`],
        imagePrompt: `${type} warm candid moment happy customers natural light ${loc}${flavor ? ` with ${flavor} mood` : ""} authentic local vibe no text`,
      };

  const v3 = wellness
    ? {
        caption: `This week at ${name}: carve out one hour just for you${flavorText} — book online or stop by and we will help you find the right session. Your ${loc} reset starts here.`,
        hashtags: ["#BookNow", "#WellnessWednesday", `#${cityTag}`],
        imagePrompt: `${type} vibrant welcoming entrance reception fresh greenery bright uplifting ${loc}${flavor ? ` with ${flavor} accents` : ""} no text no watermark`,
      }
    : {
        caption: `This week at ${name}: a simple reason to stop by ${loc}${flavorText} — ask us about our latest offer. We would love to see you.`,
        hashtags: ["#ShopLocal", "#WeekendVibes", `#${cityTag}`],
        imagePrompt: `${type} bold colorful hero product or storefront energetic ${loc}${flavor ? ` featuring ${flavor}` : ""} eye-catching no text`,
      };

  return {
    variations: [
      { id: 1, angle: "Educational", ...v1 },
      { id: 2, angle: "Emotional", ...v2 },
      { id: 3, angle: "Action", ...v3 },
    ],
    whatsapp: { message: `Hey! ${name} here — ${channelLine} Tap back if you want me to hold a spot.` },
    email: {
      subject: `${name}: something new for you`,
      body: `Hi,\n\nThanks for being part of our community at ${name}.\n\n${channelLine}\n\nWarmly,\n${name}`,
      ctaText: "Learn more",
    },
    sms: { message: `${name}: ${channelLine}`.slice(0, 160) },
  };
}
