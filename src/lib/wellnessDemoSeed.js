import { ensureSampleCollaborationCampaignsForEmail } from "@/lib/demoCollabSeed";
import { demoBusiness } from "@/lib/demoData";
import { saveOwnerUser, setOwnerSession } from "@/lib/localAuth";

/** Stable demo account — one-click “Health & Wellness” tour from the marketing site. */
export const WELLNESS_DEMO_EMAIL = "wellness-demo@localbuzz.app";
export const WELLNESS_DEMO_PASSWORD = "demo123";

/**
 * Seeds local owner user + session so the owner dashboard matches the GreenLeaf wellness demo.
 * Safe to call multiple times (upserts the same email).
 */
export function seedWellnessDemoOwner() {
  if (typeof window === "undefined") return;
  const userRecord = {
    fullName: "Blake Chen",
    email: WELLNESS_DEMO_EMAIL,
    password: WELLNESS_DEMO_PASSWORD,
    business_name: demoBusiness.business_name,
    business_type: demoBusiness.business_type,
    location: demoBusiness.location,
    neighborhood: demoBusiness.neighborhood,
    phone: demoBusiness.phone,
    language: demoBusiness.language || "English",
    address: "",
    tone: "friendly",
  };
  saveOwnerUser(userRecord);
  setOwnerSession({
    email: userRecord.email,
    role: "owner",
    business_name: userRecord.business_name,
    fullName: userRecord.fullName,
  });
  ensureSampleCollaborationCampaignsForEmail(userRecord.email);
}
