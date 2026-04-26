const OWNER_USERS_KEY = "localbuzz_owner_users";
const OWNER_SESSION_KEY = "localbuzz_owner_session";
const INFLUENCER_USERS_KEY = "localbuzz_influencer_users";
const INFLUENCER_SESSION_KEY = "localbuzz_influencer_session";

/** Seeded demo accounts — creatorId matches `demoData` influencers for campaign inbox. */
const DEFAULT_INFLUENCER_USERS = [
  { email: "sofia@localbuzz.demo", password: "demo", creatorId: "creator_1", fullName: "Sofia Martinez" },
  { email: "jenny@localbuzz.demo", password: "demo", creatorId: "creator_2", fullName: "Jenny Tran" },
  { email: "marcus@localbuzz.demo", password: "demo", creatorId: "creator_3", fullName: "Marcus Lee" },
];

const parse = (value, fallback) => {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
};

export const getOwnerUsers = () => {
  if (typeof window === "undefined") return [];
  return parse(localStorage.getItem(OWNER_USERS_KEY), []);
};

export const saveOwnerUser = (user) => {
  if (typeof window === "undefined") return;
  const existing = getOwnerUsers();
  const deduped = existing.filter((item) => item.email?.toLowerCase() !== user.email?.toLowerCase());
  localStorage.setItem(OWNER_USERS_KEY, JSON.stringify([...deduped, user]));
};

export const setOwnerSession = (session) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(session));
};

export const getOwnerSession = () => {
  if (typeof window === "undefined") return null;
  return parse(localStorage.getItem(OWNER_SESSION_KEY), null);
};

export const getInfluencerUsers = () => {
  if (typeof window === "undefined") return DEFAULT_INFLUENCER_USERS;
  const raw = localStorage.getItem(INFLUENCER_USERS_KEY);
  if (!raw) {
    localStorage.setItem(INFLUENCER_USERS_KEY, JSON.stringify(DEFAULT_INFLUENCER_USERS));
    return DEFAULT_INFLUENCER_USERS;
  }
  return parse(raw, DEFAULT_INFLUENCER_USERS);
};

export const saveInfluencerUser = (user) => {
  if (typeof window === "undefined") return;
  const existing = getInfluencerUsers();
  const deduped = existing.filter((item) => item.email?.toLowerCase() !== user.email?.toLowerCase());
  localStorage.setItem(INFLUENCER_USERS_KEY, JSON.stringify([...deduped, user]));
};

/** Influencer demo session — creatorId matches demoData influencers. */
export const setInfluencerSession = (session) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(INFLUENCER_SESSION_KEY, JSON.stringify(session));
};

export const getInfluencerSession = () => {
  if (typeof window === "undefined") return null;
  return parse(localStorage.getItem(INFLUENCER_SESSION_KEY), null);
};
