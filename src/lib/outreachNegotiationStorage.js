const KEY = "localbuzz_outreach_negotiation";

function readAll() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getNegotiationThread(creatorId) {
  if (!creatorId) return [];
  const all = readAll();
  return Array.isArray(all[creatorId]) ? all[creatorId] : [];
}

export function appendNegotiationMessage(creatorId, message) {
  if (!creatorId || !message?.text) return;
  const all = readAll();
  const list = Array.isArray(all[creatorId]) ? all[creatorId] : [];
  const entry = {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    from: message.from,
    text: message.text,
    at: new Date().toISOString(),
  };
  list.push(entry);
  all[creatorId] = list;
  writeAll(all);
  return list;
}

export function clearNegotiationThread(creatorId) {
  const all = readAll();
  delete all[creatorId];
  writeAll(all);
}

/** Replace entire thread (used for sample seeding). */
export function setNegotiationThread(creatorId, messages) {
  if (!creatorId || !Array.isArray(messages)) return;
  const all = readAll();
  all[creatorId] = messages.map((m, i) => ({
    id: m.id || `seed_${creatorId}_${i}`,
    from: m.from,
    text: m.text,
    at: m.at || new Date().toISOString(),
  }));
  writeAll(all);
}
