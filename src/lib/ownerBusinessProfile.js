import { demoBusiness } from "@/lib/demoData";
import { fetchOwnerBusinessFromSupabase } from "@/lib/fetchOwnerBusinessFromSupabase";
import { getOwnerSession, getOwnerUsers } from "@/lib/localAuth";

export function buildOwnerBusinessForSession() {
  const empty = {
    id: "",
    business_name: "",
    business_type: "",
    location: "",
    neighborhood: "",
    language: "English",
    phone: "",
    tone: "friendly",
    fullName: "",
    customer_emails: [],
    customer_phones: [],
  };
  if (typeof window === "undefined") return empty;
  const session = getOwnerSession();
  const user = session?.email ? getOwnerUsers().find((item) => item.email === session.email) : null;
  if (!user) {
    return {
      ...empty,
      id: session?.email || "",
      business_name: (session?.business_name || "").trim(),
      fullName: (session?.fullName || "").trim(),
      customer_emails: demoBusiness.customer_emails,
      customer_phones: demoBusiness.customer_phones,
    };
  }
  return {
    id: user.email,
    business_name: user.business_name,
    business_type: user.business_type,
    location: user.location || "",
    neighborhood: user.neighborhood || "",
    language: user.language || "English",
    phone: user.phone || "",
    tone: user.tone || "friendly",
    fullName: (user.fullName || session?.fullName || "").trim(),
    customer_emails: user.customer_emails?.length ? user.customer_emails : demoBusiness.customer_emails,
    customer_phones: user.customer_phones?.length ? user.customer_phones : demoBusiness.customer_phones,
  };
}

export function mergeOwnerBusinessWithRemote(local, remote) {
  if (!remote) return local;
  return {
    ...local,
    id: remote.id || local.id,
    business_name: remote.business_name || local.business_name,
    business_type: remote.business_type || local.business_type,
    location: remote.location || local.location,
    neighborhood: remote.neighborhood || local.neighborhood,
    phone: remote.phone || local.phone,
    language: remote.language || local.language,
    customer_emails: remote.customer_emails?.length ? remote.customer_emails : local.customer_emails,
    customer_phones: remote.customer_phones?.length ? remote.customer_phones : local.customer_phones,
  };
}

/** Owner display name for outreach (first name preferred). */
export function getOwnerFirstName(businessProfile) {
  const raw = (businessProfile?.fullName || "").trim();
  if (!raw) return "";
  return raw.split(/\s+/)[0] || "";
}

export async function loadMergedOwnerBusiness() {
  const local = buildOwnerBusinessForSession();
  const session = getOwnerSession();
  const remote = await fetchOwnerBusinessFromSupabase(session?.email || local.id);
  return mergeOwnerBusinessWithRemote(local, remote);
}
