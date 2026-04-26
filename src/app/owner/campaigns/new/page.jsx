"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/owner/Sidebar";
import { demoBusiness } from "@/lib/demoData";
import { getOwnerSession, getOwnerUsers } from "@/lib/localAuth";
import { newCampaignId, upsertCampaign } from "@/lib/campaignStorage";
import { STATUS, defaultDueDate } from "@/lib/campaignWorkflow";

function loadBusiness() {
  if (typeof window === "undefined") return demoBusiness;
  const s = getOwnerSession();
  if (!s?.email) return { ...demoBusiness };
  const user = getOwnerUsers().find((u) => u.email === s.email);
  if (!user) {
    return {
      ...demoBusiness,
      business_name: s.business_name || demoBusiness.business_name,
    };
  }
  return {
    ...demoBusiness,
    business_name: user.business_name,
    business_type: user.business_type,
    location: user.location || demoBusiness.location,
    neighborhood: user.neighborhood || "",
    language: user.language || "English",
    tone: user.tone || "friendly",
  };
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [business] = useState(loadBusiness);
  const [title, setTitle] = useState("");
  const [campaignType, setCampaignType] = useState("awareness");
  const [budget, setBudget] = useState("$500–$1,500");
  const [goals, setGoals] = useState("");
  const [ranked, setRanked] = useState([]);
  const [selected, setSelected] = useState(null);
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step !== 2) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/campaign-workflow/rank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business,
            campaign: { title, campaignType, budget, goals },
          }),
        });
        const data = await res.json();
        setRanked(data.ranked || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [step, business, title, campaignType, budget, goals]);

  const runBrief = async (inf) => {
    setLoading(true);
    try {
      const res = await fetch("/api/campaign-workflow/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business,
          campaign: { title, campaignType, budget, goals },
          influencer: inf,
        }),
      });
      const data = await res.json();
      setBrief(data.brief || null);
    } finally {
      setLoading(false);
    }
  };

  const goStep3 = async () => {
    if (!selected) return;
    setStep(3);
    await runBrief(selected);
  };

  const saveDraft = () => {
    const session = getOwnerSession();
    const id = newCampaignId();
    const campaign = {
      id,
      title: title || "Untitled campaign",
      campaignType,
      budget,
      goals,
      businessEmail: session?.email || "owner@localbuzz.app",
      businessName: business.business_name,
      businessType: business.business_type,
      location: business.location,
      neighborhood: business.neighborhood,
      influencerId: selected.id,
      influencerName: selected.name,
      influencerHandle: selected.handle,
      brief,
      status: STATUS.DRAFT,
      dueAt: defaultDueDate(),
      timeline: [{ at: new Date().toISOString(), label: "Draft created", actor: "business" }],
      approvals: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertCampaign(campaign);
    router.push(`/owner/campaigns/${id}`);
  };

  return (
    <div className="grid gap-4 bg-[#F6F9FC] p-4 lg:grid-cols-[240px_1fr]">
      <Sidebar />
      <main className="mx-auto max-w-3xl rounded-xl border border-[#E3E8EE] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#8898AA]">Step {step} of 4</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#0A2540]">New collaboration campaign</h1>

        {step === 1 && (
          <div className="mt-6 space-y-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Campaign title" />
            <select value={campaignType} onChange={(e) => setCampaignType(e.target.value)} className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3">
              <option value="awareness">Brand awareness</option>
              <option value="launch">Product / service launch</option>
              <option value="event">Event promotion</option>
              <option value="offer">Offer or promotion</option>
            </select>
            <input value={budget} onChange={(e) => setBudget(e.target.value)} className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Budget range" />
            <textarea value={goals} onChange={(e) => setGoals(e.target.value)} className="min-h-[100px] w-full rounded-[6px] border border-[#E3E8EE] p-3" placeholder="Goals & key messages" />
            <button type="button" onClick={() => setStep(2)} className="h-11 w-full rounded-[6px] bg-[#635BFF] text-sm font-semibold text-white">
              Next: AI-ranked influencers →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-[#425466]">Pick one creator. Ranking uses niche, reach, and local fit.</p>
            {loading && <p className="text-sm text-[#8898AA]">Loading recommendations…</p>}
            <div className="space-y-2">
              {ranked.map((inf) => (
                <button
                  key={inf.id}
                  type="button"
                  onClick={() => setSelected(inf)}
                  className={`w-full rounded-[8px] border p-4 text-left ${selected?.id === inf.id ? "border-[#635BFF] bg-[#F0EDFF]/40" : "border-[#E3E8EE]"}`}
                >
                  <p className="font-semibold text-[#0A2540]">{inf.name}</p>
                  <p className="text-xs text-[#425466]">{inf.handle} · {inf.location}</p>
                  <p className="mt-1 text-xs text-[#8898AA]">{inf.rankReason}</p>
                  <p className="mt-1 text-xs font-medium text-[#635BFF]">Score {inf.aiRankScore}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)} className="h-11 flex-1 rounded-[6px] border border-[#E3E8EE] text-sm">
                Back
              </button>
              <button type="button" disabled={!selected} onClick={() => goStep3()} className="h-11 flex-1 rounded-[6px] bg-[#635BFF] text-sm font-semibold text-white disabled:opacity-50">
                Next: AI brief →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-4">
            {loading && <p className="text-sm text-[#8898AA]">Generating structured brief…</p>}
            {brief && (
              <div className="rounded-[8px] border border-[#E3E8EE] bg-[#F6F9FC] p-4 text-sm text-[#0A2540]">
                <p className="font-semibold">{brief.title}</p>
                <p className="mt-2 text-[#425466]">{brief.summary}</p>
                <ul className="mt-2 list-disc pl-5 text-[#425466]">
                  {(brief.objectives || []).map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(2)} className="h-11 flex-1 rounded-[6px] border border-[#E3E8EE] text-sm">
                Back
              </button>
              <button type="button" disabled={!brief} onClick={() => setStep(4)} className="h-11 flex-1 rounded-[6px] bg-[#635BFF] text-sm font-semibold text-white disabled:opacity-50">
                Review →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-[#425466]">
              Save as draft. You will send the collaboration request from the next screen (human approval).
            </p>
            <button type="button" onClick={saveDraft} className="h-11 w-full rounded-[6px] bg-[#635BFF] text-sm font-semibold text-white">
              Save draft & open campaign →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
