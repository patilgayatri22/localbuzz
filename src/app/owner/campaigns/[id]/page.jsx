"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/owner/Sidebar";
import { getCampaignById, upsertCampaign } from "@/lib/campaignStorage";
import { demoBusiness } from "@/lib/demoData";
import { getOwnerSession, getOwnerUsers } from "@/lib/localAuth";
import { HUMAN_GATE, STATUS, transition } from "@/lib/campaignWorkflow";
import { influencers } from "@/lib/demoData";

function businessForApi() {
  const s = getOwnerSession();
  const user = s?.email ? getOwnerUsers().find((u) => u.email === s.email) : null;
  if (!user) return { ...demoBusiness, business_name: s?.business_name || demoBusiness.business_name };
  return {
    business_name: user.business_name,
    business_type: user.business_type,
    location: user.location || demoBusiness.location,
    neighborhood: user.neighborhood,
    tone: user.tone || "friendly",
    language: user.language || "English",
  };
}

export default function OwnerCampaignDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [mounted, setMounted] = useState(false);
  const [storageTick, setStorageTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [clock, setClock] = useState(() => Date.now());

  const campaign = useMemo(() => {
    if (!mounted) return null;
    void storageTick;
    return id ? getCampaignById(id) : null;
  }, [mounted, id, storageTick]);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const tid = window.setInterval(() => setClock(Date.now()), 60_000);
    return () => window.clearInterval(tid);
  }, []);

  const influencer = useMemo(() => influencers.find((i) => i.id === campaign?.influencerId), [campaign?.influencerId]);

  const refresh = (next) => {
    upsertCampaign(next);
    setStorageTick((t) => t + 1);
  };

  const sendRequest = () => {
    const res = transition(campaign, HUMAN_GATE.SEND_REQUEST);
    if (res.ok) refresh(res.campaign);
    else alert(res.error);
  };

  const generatePlan = async () => {
    if (!campaign) return;
    setBusy(true);
    try {
      const res = await fetch("/api/campaign-workflow/suggest-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: businessForApi(),
          campaign: { title: campaign.title, budget: campaign.budget, goals: campaign.goals, campaignType: campaign.campaignType },
          influencer,
          brief: campaign.brief,
        }),
      });
      const data = await res.json();
      const r2 = transition(campaign, "ai_plan_attached", { plan: data.plan });
      if (r2.ok) refresh(r2.campaign);
      else alert(r2.error);
    } finally {
      setBusy(false);
    }
  };

  const approvePlanBusiness = () => {
    const res = transition(campaign, HUMAN_GATE.APPROVE_PLAN_BUSINESS);
    if (res.ok) refresh(res.campaign);
  };

  const approveDeliverable = async () => {
    setBusy(true);
    try {
      const sumRes = await fetch("/api/campaign-workflow/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign }),
      });
      const { summary } = await sumRes.json();
      const res = transition(campaign, HUMAN_GATE.APPROVE_DELIVERABLE, { summary });
      if (res.ok) refresh(res.campaign);
    } finally {
      setBusy(false);
    }
  };

  const sendReminder = () => {
    if (!campaign || !influencer) return;
    setReminderBusy(true);
    try {
      const dueLabel =
        campaign.dueAt && new Date(campaign.dueAt).getTime() < Date.now()
          ? "timeline overdue"
          : "pending influencer post";
      const next = {
        ...campaign,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(campaign.timeline || []),
          { at: new Date().toISOString(), label: `Reminder sent to ${influencer.name} (${dueLabel})`, actor: "business" },
          { at: new Date().toISOString(), label: "Awaiting influencer update", actor: "system" },
        ],
      };
      refresh(next);
    } finally {
      window.setTimeout(() => setReminderBusy(false), 350);
    }
  };

  if (!mounted) {
    return (
      <div className="p-8">
        <p>Loading campaign…</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8">
        <p>Campaign not found.</p>
        <Link href="/owner/campaigns">Back</Link>
      </div>
    );
  }

  const due = campaign.dueAt ? new Date(campaign.dueAt) : null;
  const daysLeft = due ? Math.ceil((due.getTime() - clock) / 86400000) : null;
  const showReminder = campaign.status === STATUS.ACTIVE && daysLeft != null && daysLeft <= 3 && daysLeft >= 0;
  const timelineMissed = campaign.status === STATUS.ACTIVE && daysLeft != null && daysLeft < 0;
  const reminderStatuses = new Set([
    STATUS.SENT_TO_INFLUENCER,
    STATUS.INFLUENCER_INTERESTED,
    STATUS.INFLUENCER_COUNTER,
    STATUS.PLAN_PENDING_APPROVAL,
    STATUS.ACTIVE,
    STATUS.PENDING_DELIVERABLE_APPROVAL,
  ]);
  const needsInfluencerPost = reminderStatuses.has(campaign.status) && !campaign.submittedContent;

  return (
    <div className="grid gap-4 bg-[#F6F9FC] p-4 lg:grid-cols-[240px_1fr]">
      <Sidebar />
      <main className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href="/owner/campaigns" className="text-sm text-[#635BFF]">
            ← All campaigns
          </Link>
          <span className="rounded-full bg-[#F0EDFF] px-3 py-1 text-xs font-medium text-[#635BFF]">{campaign.status}</span>
        </div>

        {showReminder && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Reminder: deliverable due in <strong>{daysLeft}</strong> day{daysLeft === 1 ? "" : "s"}.
          </div>
        )}
        {needsInfluencerPost && (
          <div className="rounded-xl border border-[#E3E8EE] bg-white px-4 py-3 text-sm text-[#425466]">
            No post submitted by influencer yet.
            <button
              type="button"
              onClick={sendReminder}
              disabled={reminderBusy}
              className="ml-3 rounded-md bg-[#635BFF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {reminderBusy ? "Sending…" : "Send reminder to influencer"}
            </button>
          </div>
        )}
        {timelineMissed && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            Timeline overdue by <strong>{Math.abs(daysLeft)}</strong> day{Math.abs(daysLeft) === 1 ? "" : "s"}.
          </div>
        )}

        <section className="rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#0A2540]">{campaign.title}</h1>
          <p className="mt-1 text-sm text-[#425466]">
            With {campaign.influencerName} ({campaign.influencerHandle})
          </p>
        </section>

        {campaign.brief && (
          <section className="rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0A2540]">Brief</h2>
            <p className="mt-2 text-sm text-[#425466]">{campaign.brief.summary}</p>
          </section>
        )}

        {campaign.status === STATUS.DRAFT && (
          <section className="rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0A2540]">Human approval: send request</h2>
            <p className="mt-2 text-sm text-[#425466]">Sends the structured collaboration request to the influencer.</p>
            <button type="button" onClick={sendRequest} className="mt-4 h-11 rounded-[6px] bg-[#635BFF] px-6 text-sm font-semibold text-white">
              Send collaboration request
            </button>
          </section>
        )}

        {(campaign.status === STATUS.INFLUENCER_INTERESTED || campaign.status === STATUS.INFLUENCER_COUNTER) && (
          <section className="rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0A2540]">AI: suggest plan</h2>
            {campaign.status === STATUS.INFLUENCER_COUNTER && campaign.counterOffer && (
              <p className="mt-2 rounded-lg bg-[#F6F9FC] p-3 text-sm text-[#425466]">
                Influencer counter: {campaign.counterOffer}
              </p>
            )}
            <p className="mt-2 text-sm text-[#425466]">Generates suggested pricing and deliverables. Both sides must still approve.</p>
            <button type="button" disabled={busy} onClick={generatePlan} className="mt-4 h-11 rounded-[6px] bg-[#635BFF] px-6 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Working…" : "Generate AI plan"}
            </button>
          </section>
        )}

        {campaign.suggestedPlan && campaign.status === STATUS.PLAN_PENDING_APPROVAL && (
          <section className="rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0A2540]">Suggested plan</h2>
            <p className="mt-2 text-sm text-[#425466]">${campaign.suggestedPlan.suggestedPriceUsd} — {campaign.suggestedPlan.priceRationale}</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-[#425466]">
              {(campaign.suggestedPlan.deliverables || []).map((d, i) => (
                <li key={i}>
                  {d.quantity}× {d.type}: {d.description}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[#8898AA]">{campaign.suggestedPlan.paymentTerms}</p>
            {campaign.approvals?.businessPlan && !campaign.approvals?.influencerPlan && (
              <p className="mt-3 rounded-lg bg-[#F6F9FC] px-3 py-2 text-sm text-[#425466]">You approved. Waiting for the influencer to approve on their side.</p>
            )}
            {!campaign.approvals?.businessPlan && campaign.approvals?.influencerPlan && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">The influencer approved. Please confirm on your side.</p>
            )}
            <button
              type="button"
              disabled={campaign.approvals?.businessPlan}
              onClick={approvePlanBusiness}
              className="mt-4 h-11 rounded-[6px] bg-[#635BFF] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {campaign.approvals?.businessPlan ? "Plan approved (business)" : "Approve plan (business)"}
            </button>
            <p className="mt-2 text-xs text-[#8898AA]">The campaign becomes active only after both you and the influencer approve.</p>
          </section>
        )}

        {campaign.status === STATUS.ACTIVE && (
          <section className="rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0A2540]">Deliverable</h2>
            <p className="text-sm text-[#425466]">Influencer submits a post link. You approve before completion.</p>
            <p className="mt-2 text-xs text-[#8898AA]">Influencer submits from their campaign page.</p>
          </section>
        )}

        {campaign.status === STATUS.CONTENT_SUBMITTED && (
          <section className="rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0A2540]">Review deliverable</h2>
            <a href={campaign.submittedContent} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-[#635BFF] underline">
              {campaign.submittedContent}
            </a>
            <button type="button" disabled={busy} onClick={approveDeliverable} className="mt-4 h-11 rounded-[6px] bg-[#635BFF] px-6 text-sm font-semibold text-white">
              {busy ? "Generating summary…" : "Approve deliverable & complete"}
            </button>
          </section>
        )}

        {campaign.status === STATUS.COMPLETED && (
          <section className="rounded-xl border border-[#09825D]/30 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#09825D]">Completed</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-[#425466]">{campaign.resultsSummary}</p>
          </section>
        )}

        <section className="rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-[#0A2540]">Timeline</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#425466]">
            {(campaign.timeline || []).map((t, i) => (
              <li key={i}>
                <span className="text-xs text-[#8898AA]">{new Date(t.at).toLocaleString()}</span> — {t.label}{" "}
                <span className="text-xs">({t.actor})</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
