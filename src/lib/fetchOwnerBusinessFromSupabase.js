import { supabase } from "@/lib/supabaseClient";

/**
 * Loads the signed-in owner's business row from Supabase (profiles → businesses).
 * Returns null if Supabase is not configured, the profile is missing, or no business row.
 */
export async function fetchOwnerBusinessFromSupabase(ownerEmail) {
  const email = (ownerEmail || "").trim().toLowerCase();
  if (!supabase || !email) return null;

  const { data: profile, error: pErr } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
  if (pErr || !profile?.id) return null;

  const { data: row, error: bErr } = await supabase
    .from("businesses")
    .select("id, business_name, business_type, location, neighborhood, phone, language, customer_emails, customer_phones")
    .eq("owner_id", profile.id)
    .maybeSingle();

  if (bErr || !row) return null;

  return {
    id: row.id,
    business_name: row.business_name,
    business_type: row.business_type,
    location: row.location || "",
    neighborhood: row.neighborhood || "",
    phone: row.phone || "",
    language: row.language || "English",
    customer_emails: Array.isArray(row.customer_emails) ? row.customer_emails : [],
    customer_phones: Array.isArray(row.customer_phones) ? row.customer_phones : [],
  };
}
