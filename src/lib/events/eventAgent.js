// ============================================================
// LocalBuzz — Event Matching + Outreach Agent
// Fetches events from Eventbrite + Luma, scores vs business,
// generates outreach via Gemini (server-side only).
// ============================================================

const BUSINESS_EVENT_MATCHING = {
  nail_salon: {
    keywords: ["beauty", "wellness", "self care", "bridal", "wedding", "fashion", "women", "spa", "girls night", "bachelorette", "pop up", "market", "boutique"],
    perfectMatch: ["bridal expo", "wedding fair", "beauty pop up", "women's market", "bachelorette"],
    goodMatch: ["fashion show", "girls night out", "wellness fair", "community market"],
    pitch: "We'd love to set up a nail bar at your event — guests get complimentary mini manis and we handle everything.",
  },
  restaurant: {
    keywords: ["food", "dining", "tasting", "festival", "community", "fundraiser", "market", "beer", "wine", "culture", "neighborhood", "street fair"],
    perfectMatch: ["food festival", "street fair", "farmers market", "tasting event", "neighborhood block party"],
    goodMatch: ["fundraiser", "community event", "cultural festival", "night market"],
    pitch: "We'd love to participate as a food vendor or cater for your event — we specialize in local flavors and serve the community.",
  },
  coffee_shop: {
    keywords: ["morning", "networking", "startup", "creative", "art", "music", "pop up", "market", "work", "community", "meetup", "tech"],
    perfectMatch: ["networking breakfast", "morning meetup", "creative market", "art show", "startup event"],
    goodMatch: ["community gathering", "pop up market", "tech meetup", "music event"],
    pitch: "We'd love to sponsor the coffee for your event or set up a coffee station — great way to connect our regulars with your attendees.",
  },
  spa: {
    keywords: ["wellness", "health", "yoga", "meditation", "women", "self care", "retreat", "fitness", "mindfulness", "beauty", "bridal"],
    perfectMatch: ["wellness retreat", "yoga event", "women's wellness", "bridal show", "health fair"],
    goodMatch: ["fitness expo", "mindfulness event", "beauty fair", "community health"],
    pitch: "We'd love to offer complimentary mini treatments or a wellness booth at your event — massage demos, skincare consultations, or relaxation stations.",
  },
  health_wellness: {
    keywords: ["wellness", "health", "fitness", "yoga", "meditation", "self care", "community", "mindfulness", "nutrition", "holistic"],
    perfectMatch: ["wellness fair", "health fair", "fitness expo", "yoga event", "community health"],
    goodMatch: ["farmers market", "community event", "fundraiser", "5k", "fun run"],
    pitch: "We'd love to partner on wellness activations — demos, samples, or a booth that fits your audience.",
  },
  bakery: {
    keywords: ["community", "market", "fair", "school", "fundraiser", "holiday", "wedding", "bridal", "art", "pop up", "neighborhood"],
    perfectMatch: ["farmers market", "holiday market", "school fundraiser", "wedding expo", "pop up market"],
    goodMatch: ["community fair", "neighborhood event", "art show", "cultural festival"],
    pitch: "We'd love to sell or donate baked goods at your event — we can also do custom orders for attendees on the spot.",
  },
  gym: {
    keywords: ["fitness", "health", "wellness", "sport", "run", "race", "yoga", "crossfit", "outdoor", "community", "challenge", "active"],
    perfectMatch: ["fun run", "fitness expo", "wellness fair", "sports event", "obstacle race"],
    goodMatch: ["community health fair", "outdoor event", "school sports day", "charity run"],
    pitch: "We'd love to sponsor or host a fitness activity at your event — free classes, workout demos, or a wellness booth.",
  },
};

const OUTREACH_TONES = {
  sponsor: "We want to sponsor or contribute to your event",
  vendor: "We want to set up a booth or stall at your event",
  partner: "We want to cross-promote and bring our customers to your event",
  attend: "We want to attend and represent our business",
};

/** Map UI business_type string to BUSINESS_EVENT_MATCHING key */
export function normalizeEventBusinessType(input) {
  if (!input) return "restaurant";
  const key = String(input)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  const aliases = {
    nail_salon: "nail_salon",
    nail: "nail_salon",
    coffee_shop: "coffee_shop",
    coffee: "coffee_shop",
    health_wellness: "health_wellness",
    healthandwellness: "health_wellness",
    hair_salon: "nail_salon",
    food_truck: "restaurant",
    retail_store: "restaurant",
  };
  if (BUSINESS_EVENT_MATCHING[key]) return key;
  if (aliases[key]) return aliases[key];
  if (key.includes("nail")) return "nail_salon";
  if (key.includes("coffee")) return "coffee_shop";
  if (key.includes("spa")) return "spa";
  if (key.includes("bakery")) return "bakery";
  if (key.includes("gym") || key.includes("fitness")) return "gym";
  if (key.includes("health") || key.includes("wellness")) return "health_wellness";
  if (key.includes("restaurant")) return "restaurant";
  return "restaurant";
}

/** Build { type, city, neighborhood, name } from LocalBuzz business object */
export function normalizeBusinessForEvents(business = {}) {
  const type = normalizeEventBusinessType(business.business_type || business.type);
  const loc = business.location || business.city || "Oakland, CA";
  const cityPart = String(loc).split(",")[0].trim() || "Oakland";
  return {
    type,
    city: cityPart,
    neighborhood: business.neighborhood || "",
    name: business.business_name || business.name || "Local business",
    raw: business,
  };
}

/**
 * Fetches local events from Eventbrite
 * @see https://www.eventbrite.com/platform/api
 */
export async function fetchEventbriteEvents(city, keywords, radiusMiles = 10) {
  const token = process.env.EVENTBRITE_API_KEY;
  if (!token) return [];

  const query = keywords.slice(0, 3).join(" OR ");
  const encodedQuery = encodeURIComponent(query);
  const encodedCity = encodeURIComponent(city);

  const url = `https://www.eventbriteapi.com/v3/events/search/?q=${encodedQuery}&location.address=${encodedCity}&location.within=${radiusMiles}mi&expand=organizer,venue&sort_by=date&start_date.keyword=this_week`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error("[Eventbrite] API error:", res.status);
      return [];
    }

    const data = await res.json();

    return (data.events || []).map((event) => {
      const venue = event.venue;
      return {
        source: "eventbrite",
        id: `eb_${event.id}`,
        title: event.name?.text || "Untitled Event",
        description: event.description?.text?.slice(0, 500) || "",
        date: event.start?.local || "",
        url: event.url || "",
        venue: venue?.name || "",
        address: venue?.address?.localized_address_display || city,
        organizer: {
          name: event.organizer?.name || "",
          email: event.organizer?.email || null,
          url: event.organizer?.url || "",
          id: event.organizer?.id || "",
        },
        capacity: event.capacity ?? null,
        isFree: event.is_free || false,
        imageUrl: event.logo?.url || null,
      };
    });
  } catch (err) {
    console.error("[Eventbrite] Fetch error:", err.message);
    return [];
  }
}

/**
 * Fetches local events from Luma public discover (optional API key)
 */
export async function fetchLumaEvents(city, keywords) {
  const query = keywords.slice(0, 3).join(" ");
  const encodedQuery = encodeURIComponent(query);
  const encodedCity = encodeURIComponent(city);

  const url = `https://api.lu.ma/public/v1/discover/events?query=${encodedQuery}&location=${encodedCity}&pagination_limit=20`;

  try {
    const headers = { accept: "application/json" };
    if (process.env.LUMA_API_KEY) {
      headers["x-luma-api-key"] = process.env.LUMA_API_KEY;
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
      console.error("[Luma] API error:", res.status);
      return [];
    }

    const data = await res.json();
    const events = data.entries || data.events || [];

    return events.map((item) => {
      const event = item.event || item;
      return {
        source: "luma",
        id: `luma_${event.api_id || event.id}`,
        title: event.name || "Untitled Event",
        description: (event.description || "").slice(0, 500),
        date: event.start_at || "",
        url: `https://lu.ma/${event.url || event.slug || event.api_id || ""}`,
        venue: event.geo_address_info?.full_address || "",
        address: event.geo_address_info?.city_state || city,
        organizer: {
          name: event.hosts?.[0]?.name || "",
          email: null,
          username: event.hosts?.[0]?.username || "",
          avatarUrl: event.hosts?.[0]?.avatar_url || null,
          lumaUrl: event.hosts?.[0]?.username ? `https://lu.ma/${event.hosts[0].username}` : "",
        },
        capacity: event.capacity ?? null,
        isFree: event.ticket_info?.is_free ?? true,
        imageUrl: event.cover_url || null,
        guestCount: event.guest_count || 0,
      };
    });
  } catch (err) {
    console.error("[Luma] Fetch error:", err.message);
    return [];
  }
}

export function scoreEvent(event, businessNorm) {
  const bizType = businessNorm.type || "restaurant";
  const matchConfig = BUSINESS_EVENT_MATCHING[bizType] || BUSINESS_EVENT_MATCHING.restaurant;
  const searchText = `${event.title} ${event.description}`.toLowerCase();
  let score = 0;

  matchConfig.perfectMatch?.forEach((kw) => {
    if (searchText.includes(kw.toLowerCase())) score += 35;
  });

  matchConfig.goodMatch?.forEach((kw) => {
    if (searchText.includes(kw.toLowerCase())) score += 20;
  });

  matchConfig.keywords?.forEach((kw) => {
    if (searchText.includes(kw.toLowerCase())) score += 5;
  });

  const cityLower = (businessNorm.city || "").toLowerCase();
  if (cityLower && (event.address || "").toLowerCase().includes(cityLower)) {
    score += 15;
  }

  if (businessNorm.neighborhood && (event.address || "").toLowerCase().includes(businessNorm.neighborhood.toLowerCase())) {
    score += 10;
  }

  if (event.date) {
    const daysUntil = Math.floor((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil >= 0 && daysUntil <= 14) score += 10;
    if (daysUntil < 0) score -= 50;
  }

  return Math.min(100, Math.max(0, score));
}

export async function generateOutreachMessage(event, businessNorm, outreachType = "partner") {
  const bizType = businessNorm.type || "restaurant";
  const matchConfig = BUSINESS_EVENT_MATCHING[bizType] || BUSINESS_EVENT_MATCHING.restaurant;
  const toneInfo = OUTREACH_TONES[outreachType] || OUTREACH_TONES.partner;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return {
      email: {
        subject: `Idea for ${event.title}`,
        body: `Hi ${event.organizer?.name || "there"},\n\nWe're ${businessNorm.name} (${bizType.replace(/_/g, " ")} in ${businessNorm.city}). ${matchConfig.pitch}\n\nWould you be open to a quick chat?\n\nThanks,\n${businessNorm.name}`,
      },
      instagramDm: `Hey! Love what you're doing with ${event.title}. We're ${businessNorm.name} nearby — ${matchConfig.pitch} Interested?`,
      whatsapp: `Hi — ${businessNorm.name} here. ${event.title} looks great. ${toneInfo}. Open to chatting?`,
    };
  }

  const systemPrompt = `
You are an expert outreach copywriter for small local businesses.
Write short, warm, personalized messages from a business owner to an event organizer.
Goal: get a response — start a real conversation.

RULES:
- Sound like a real local owner, not an agency
- Reference the event name naturally
- Lead with what you can offer them
- Never: "I hope this message finds you well", "synergy", "leverage", "utilize"
- Email: subject under 50 chars, body under 150 words
- Instagram DM: under 100 words, casual
- End with a soft question

Business: ${businessNorm.name}
Business type: ${bizType.replace(/_/g, " ")}
Location: ${businessNorm.city}
What they offer: ${matchConfig?.pitch || "We'd love to collaborate on your event"}
Outreach goal: ${toneInfo}

Return ONLY valid JSON:
{
  "email": { "subject": "", "body": "" },
  "instagramDm": "",
  "whatsapp": ""
}
`;

  const userPrompt = `
Event name: ${event.title}
Event date: ${event.date ? new Date(event.date).toDateString() : "upcoming"}
Event location: ${event.address || event.venue}
Organizer: ${event.organizer?.name || "there"}
Description: ${(event.description || "").slice(0, 300)}
Source: ${event.source} ${event.url || ""}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini outreach error: ${err}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      email: { subject: "Collaboration idea for your event", body: rawText },
      instagramDm: rawText,
      whatsapp: rawText,
    };
  }
}

/** Map scored API event to EventCard shape */
export function toEventCard(event, businessNorm) {
  const pct = Math.round(event.matchScore ?? 0);
  const typeLabel = (businessNorm.type || "business").replace(/_/g, " ");
  let dateLabel = event.date || "TBD";
  try {
    if (event.date) dateLabel = new Date(event.date).toLocaleString();
  } catch {
    /* keep */
  }
  return {
    id: event.id,
    name: event.title,
    date: dateLabel,
    location: event.venue || event.address || businessNorm.city,
    distance: "—",
    attendance: event.capacity ?? event.guestCount ?? "—",
    score: `${pct}% match for ${typeLabel}`,
    niches: [event.source, event.isFree ? "Free" : "Paid"].filter(Boolean),
    description: (event.description || "").slice(0, 220) || "Local event from Eventbrite or Luma.",
    _raw: event,
  };
}

export async function findMatchingEvents(businessInput, limit = 10) {
  const businessNorm = normalizeBusinessForEvents(businessInput);
  const matchConfig = BUSINESS_EVENT_MATCHING[businessNorm.type] || BUSINESS_EVENT_MATCHING.restaurant;
  const keywords = matchConfig?.keywords || ["community", "local", "event"];
  const city = businessNorm.city || "Oakland";

  const [eventbriteResult, lumaResult] = await Promise.allSettled([
    fetchEventbriteEvents(city, keywords),
    fetchLumaEvents(city, keywords),
  ]);

  const allEvents = [
    ...(eventbriteResult.status === "fulfilled" ? eventbriteResult.value : []),
    ...(lumaResult.status === "fulfilled" ? lumaResult.value : []),
  ];

  const scored = allEvents
    .map((event) => ({
      ...event,
      matchScore: scoreEvent(event, businessNorm),
    }))
    .filter((e) => e.matchScore > 20)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
    .map((e) => toEventCard(e, businessNorm));

  return scored;
}
