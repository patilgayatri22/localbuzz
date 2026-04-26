// ============================================================
// LocalBuzz — Post Generation Agent
// RAG / System Prompt Builder for Gemini API
// ============================================================

const PLATFORM_KNOWLEDGE = {
  instagram: {
    name: "Instagram",
    format: "Caption with hook + body + CTA + hashtags",
    maxChars: 2200,
    idealLength: "150 to 300 characters for best engagement",
    hashtagCount: "5 to 10 hashtags on their own line at the bottom",
    emojiUsage: "2 to 5 emojis, placed naturally inside the text",
    rules: [
      "First line must be a strong hook - this is what shows before 'more'",
      "Use short paragraphs, 1 to 2 lines each",
      "Add one clear call to action near the end",
      "Put all hashtags together on the last line",
      "Never start with the business name - lead with value or curiosity",
    ],
    goodExample: `Your nails deserve a glow-up this weekend.

Book a gel manicure with us and walk out feeling like a whole new person. We use only non-toxic, long-lasting gel polishes.

DM us to book or just stop by.

#OaklandNails #GelNails #NailSalon #OaklandBeauty #SelfCare`,
    badExample:
      "Oakland Nails & Spa has a promotion this week. Come get your nails done. We are open Monday to Sunday. #nails #salon",
  },
  whatsapp: {
    name: "WhatsApp",
    format: "Short conversational message, like texting a friend",
    maxChars: 1000,
    idealLength: "50 to 150 characters",
    emojiUsage: "1 to 3 emojis max",
    rules: [
      "Sound like a real person texting, not a brand broadcast",
      "Get to the point in the first sentence",
      "Include offer or news right away",
      "End with one simple action",
      "No hashtags",
    ],
    goodExample:
      "Hey! We just dropped a new lunch special for today only. Come by before 3pm and mention this message for a free drink.",
    badExample:
      "Dear valued customer, we are pleased to announce a special promotion. Please visit our establishment at your earliest convenience.",
  },
  email: {
    name: "Email",
    format: "Subject + greeting + body + CTA + sign-off",
    maxChars: 5000,
    idealLength: "150 to 300 words",
    emojiUsage: "Optional - 1 emoji in subject",
    rules: [
      "Subject line under 50 characters",
      "Open with warm greeting",
      "Lead with the most valuable information first",
      "Include exactly one CTA button text",
      "Sign off with owner or business name",
    ],
    goodExample: {
      subject: "Your weekend plans just got better",
      body: `Hi there,

This Saturday and Sunday only, we are offering 20% off key services.

[BOOK YOUR SPOT]

Warmly,
The team`,
    },
    badExample: "N/A",
  },
  sms: {
    name: "SMS",
    format: "One short sentence with offer + action",
    maxChars: 160,
    idealLength: "Under 140 characters",
    emojiUsage: "0 to 1 emoji",
    rules: [
      "160 characters max",
      "Lead with offer immediately",
      "Include business name",
      "One action only",
      "No hashtags",
    ],
    goodExample:
      "Oakland Nails: 20% off this weekend. Walk-ins welcome. Reply STOP to unsubscribe.",
    badExample:
      "Hey there! We just wanted to let you know that this weekend we are having a promotion where you can get 20% off!",
  },
};

const TONE_LIBRARY = {
  promotional: {
    label: "Promotional",
    description: "Urgency-driven, benefit-first framing",
    keywords: ["today only", "this week only", "limited spots", "save now"],
    avoid: ["maybe", "perhaps", "no rush"],
  },
  friendly: {
    label: "Friendly & Warm",
    description: "Like a neighbor recommending something they love",
    keywords: ["come by", "we'd love to see you", "treat yourself", "you deserve it"],
    avoid: ["utilize", "leverage", "at your earliest convenience"],
  },
  festive: {
    label: "Festive",
    description: "Celebratory, seasonal, feel-good energy",
    keywords: ["celebrate", "season special", "perfect gift"],
    avoid: ["standard offer", "regular hours"],
  },
  urgent: {
    label: "Urgent",
    description: "FOMO-driven, scarcity-based",
    keywords: ["last chance", "ends tonight", "act now"],
    avoid: ["eventually", "whenever"],
  },
  informational: {
    label: "Informational",
    description: "Calm and helpful updates",
    keywords: ["good news", "now available", "starting this week"],
    avoid: ["limited", "act now"],
  },
};

const BUSINESS_CONTEXT = {
  nail_salon: {
    commonOffers: ["gel manicure", "pedicure", "nail art", "spa package"],
    popularHashtags: ["#NailArt", "#GelNails", "#NailSalon", "#SelfCare"],
    localHashtags: (city) => [`#${city}Nails`, `#${city}Beauty`],
    audienceDesires: ["relaxation", "self-care", "looking polished"],
  },
  restaurant: {
    commonOffers: ["lunch special", "happy hour", "weekend brunch"],
    popularHashtags: ["#Foodie", "#EatLocal", "#LocalEats"],
    localHashtags: (city) => [`#${city}Eats`, `#${city}Food`],
    audienceDesires: ["good food fast", "family meals", "value for money"],
  },
  coffee_shop: {
    commonOffers: ["seasonal drink", "new blend", "morning special"],
    popularHashtags: ["#CoffeeLovers", "#CafeLife", "#CoffeeShop"],
    localHashtags: (city) => [`#${city}Coffee`, `#${city}Cafe`],
    audienceDesires: ["morning ritual", "work from cafe", "cozy vibe"],
  },
  spa: {
    commonOffers: ["massage", "facial", "membership", "detox treatment"],
    popularHashtags: ["#SpaDay", "#Wellness", "#SelfCare"],
    localHashtags: (city) => [`#${city}Spa`, `#${city}Wellness`],
    audienceDesires: ["stress relief", "me time", "wellness routine"],
  },
  bakery: {
    commonOffers: ["daily special", "custom cakes", "seasonal pastry"],
    popularHashtags: ["#Bakery", "#FreshBaked", "#Pastry"],
    localHashtags: (city) => [`#${city}Bakery`, `#BakedIn${city}`],
    audienceDesires: ["fresh comfort food", "special occasion cakes", "daily treats"],
  },
  gym: {
    commonOffers: ["free trial", "new member discount", "fitness challenge"],
    popularHashtags: ["#Fitness", "#GymLife", "#HealthyLiving"],
    localHashtags: (city) => [`#${city}Fitness`, `#${city}Gym`],
    audienceDesires: ["get stronger", "accountability", "community"],
  },
};

const normalizeBusinessType = (type = "") =>
  type
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "_");

export function buildSystemPrompt(business, platforms) {
  const bizType = normalizeBusinessType(business.type || business.business_type || "restaurant");
  const bizContext = BUSINESS_CONTEXT[bizType] || BUSINESS_CONTEXT.restaurant;
  const toneGuide = TONE_LIBRARY[business.tone || "friendly"] || TONE_LIBRARY.friendly;
  const city = business.city || (business.location ? String(business.location).split(",")[0] : "Oakland");
  const neighborhood = business.neighborhood || "";

  const platformInstructions = platforms
    .map((p) => {
      const rules = PLATFORM_KNOWLEDGE[p];
      if (!rules) return "";
      return `
### ${rules.name.toUpperCase()} POST
Format: ${rules.format}
Length: ${rules.idealLength}
Emojis: ${rules.emojiUsage}
Rules:
${rules.rules.map((r) => `  - ${r}`).join("\n")}

Good example:
${
  p === "email"
    ? `Subject: ${rules.goodExample.subject}\n${rules.goodExample.body}`
    : rules.goodExample
}

Bad example (NEVER write like this):
${rules.badExample}
`;
    })
    .join("\n---\n");

  const localHashtags = bizContext.localHashtags ? bizContext.localHashtags(city).join(" ") : "";

  const languageInstruction =
    business.language && business.language.toLowerCase() !== "english"
      ? `WRITE ALL POSTS IN: ${business.language.toUpperCase()}. Keep the tone natural.`
      : "Default language: English.";

  return `
You are Buzz, an expert social media marketing agent for local businesses.
Generate high-quality, platform-specific content that feels authentic and local.

BUSINESS PROFILE
- Business name: ${business.name || business.business_name || "Local business"}
- Business type: ${bizType.replace(/_/g, " ")}
- Location: ${neighborhood ? `${neighborhood}, ${city}` : city}
- Tone: ${toneGuide.label} - ${toneGuide.description}
- ${languageInstruction}

TONE GUIDE
- Use naturally: ${toneGuide.keywords.join(", ")}
- Avoid: ${toneGuide.avoid.join(", ")}

BUSINESS CONTEXT
- Common offers: ${bizContext.commonOffers.join(", ")}
- Customer desires: ${bizContext.audienceDesires.join(", ")}
- Niche hashtags: ${bizContext.popularHashtags.join(" ")}
- Local hashtags: ${localHashtags}

PLATFORM INSTRUCTIONS
${platformInstructions}

GOLDEN RULES
1. Never sound robotic or generic
2. Never start with business name
3. Always include one clear CTA
4. Follow platform style strictly
5. Never invent exact prices/hours/addresses unless user gives them

OUTPUT FORMAT
Return ONLY valid JSON, no markdown:
{
  "instagram": {
    "caption": "text",
    "hashtags": ["#tag1", "#tag2"],
    "characterCount": 120
  },
  "whatsapp": {
    "message": "text",
    "characterCount": 80
  },
  "email": {
    "subject": "text",
    "body": "text",
    "ctaText": "Book Now",
    "characterCount": 250
  },
  "sms": {
    "message": "text",
    "characterCount": 120
  }
}
Only include requested platforms.
`;
}

export function buildUserPrompt(userInput, platforms, extras = {}) {
  const platformList = platforms.join(", ");
  let extraContext = "";
  if (extras.offer) extraContext += `\nSpecific offer: ${extras.offer}`;
  if (extras.price) extraContext += `\nPrice: ${extras.price}`;
  if (extras.date) extraContext += `\nDate/time: ${extras.date}`;
  if (extras.location) extraContext += `\nLocation detail: ${extras.location}`;

  return `
Generate marketing posts for: ${platformList}

Owner message:
"${userInput}"
${extraContext}

Use exact details from the owner message when provided.
Return JSON only.
`;
}

export async function generatePosts(userInput, business, platforms) {
  const systemPrompt = buildSystemPrompt(business, platforms);
  const userPrompt = buildUserPrompt(userInput, platforms);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("No content returned from Gemini");

  const cleaned = rawText.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse Gemini response as JSON: ${cleaned}`);
  }
}
