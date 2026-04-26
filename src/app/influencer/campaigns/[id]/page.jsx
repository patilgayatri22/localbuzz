"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import InfluencerSidebar from "@/components/influencer/InfluencerSidebar";
import { getCampaignById, upsertCampaign } from "@/lib/campaignStorage";
import { getInfluencerSession } from "@/lib/localAuth";
import { HUMAN_GATE, STATUS, transition } from "@/lib/campaignWorkflow";

export default function InfluencerCampaignDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [storageTick, setStorageTick] = useState(0);
  const [counterText, setCounterText] = useState("");
  const [detailsQuestion, setDetailsQuestion] = useState("");
  const [submitUrl, setSubmitUrl] = useState("");
  const session = useMemo(() => (typeof window !== "undefined" ? getInfluencerSession() : null), []);

  const campaign = useMemo(() => {
    void storageTick;
    return id ? getCampaignById(id) : null;
  }, [id, storageTick]);

  const refresh = (next) => {
    upsertCampaign(next);
    setStorageTick((t) => t + 1);
  };

  const respond = (choice, extra = {}) => {
    if (!campaign) return;
    const res = transition(campaign, HUMAN_GATE.INFLUENCER_RESPONSE, { choice, ...extra });
    if (res.ok) refresh(res.campaign);
    else alert(res.error);
  };

  const approvePlan = () => {
    if (!campaign) return;
    const res = transition(campaign, HUMAN_GATE.APPROVE_PLAN_INFLUENCER);
    if (res.ok) refresh(res.campaign);
    else alert(res.error);
  };

  const submitContent = () => {
    if (!campaign || !submitUrl.trim()) return;
    const res = transition(campaign, "influencer_submit_content", { url: submitUrl.trim() });
    if (res.ok) refresh(res.campaign);
    else alert(res.error);
  };

  if (!session?.creatorId) {
    return (
      <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
        <InfluencerSidebar />
        <main className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Please sign in.</p>
          <Link href="/signin" className="text-pink-600 underline">
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
        <InfluencerSidebar />
        <main className="rounded-2xl bg-white p-6 shadow-sm">
          <p>Campaign not found.</p>
          <Link href="/influencer/campaigns">Back</Link>
        </main>
      </div>
    );
  }

  if (campaign.influencerId !== session.creatorId) {
    return (
      <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
        <InfluencerSidebar />
        <main className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">This request is for a different creator account.</p>
          <Link href="/influencer/campaigns" className="text-pink-600 underline">
            Back to inbox
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
      <InfluencerSidebar />
      <main className="space-y-4">
        <Link href="/influencer/campaigns" className="text-sm text-pink-600">
          ← Inbox
        </Link>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-[#0A2540]">{campaign.title}</h1>
            <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-800">{campaign.status}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            From {campaign.businessName || "Business"} · Budget hint: {campaign.budget}
          </p>
        </section>

        {campaign.brief && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0A2540]">Request details</h2>
            <p className="mt-2 text-sm text-gray-700">{campaign.brief.summary}</p>
          </section>
        )}

        {campaign.status === STATUS.SENT_TO_INFLUENCER && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0A2540]">Your response</h2>
            <p className="mt-1 text-sm text-gray-600">You control the next step; the business will not be notified until you choose.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => respond("interested")} className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white">
                Interested
              </button>
              <button type="button" onClick={() => respond("reject")} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-800">
                Reject
              </button>
            </div>
            <div className="mt-6 border-t border-gray-100 pt-4">
              <label className="text-xs font-medium text-gray-500">Counter offer (optional note)</label>
              <textarea
                value={counterText}
                onChange={(e) => setCounterText(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm"
                rows={2}
                placeholder="e.g. Different rate or timeline…"
              />
              <button
                type="button"
                disabled={!counterText.trim()}
                onClick={() => {
                  respond("counter", { counterOffer: counterText.trim() });
                  setCounterText("");
                }}
                className="mt-2 rounded-lg border border-pink-300 px-4 py-2 text-sm font-medium text-pink-800 disabled:opacity-40"
              >
                Send counter offer
              </button>
            </div>
            <div className="mt-6 border-t border-gray-100 pt-4">
              <label className="text-xs font-medium text-gray-500">Ask for more details</label>
              <textarea
                value={detailsQuestion}
                onChange={(e) => setDetailsQuestion(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm"
                rows={2}
                placeholder="What do you need clarified?"
              />
              <button
                type="button"
                disabled={!detailsQuestion.trim()}
                onClick={() => {
                  respond("more_details", { question: detailsQuestion.trim() });
                  setDetailsQuestion("");
                }}
                className="mt-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-800 disabled:opacity-40"
              >
                Ask for more details
              </button>
            </div>
          </section>
        )}

        {campaign.status === STATUS.PLAN_PENDING_APPROVAL && campaign.suggestedPlan && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0A2540]">Suggested plan</h2>
            <p className="mt-2 text-sm text-gray-700">
              ${campaign.suggestedPlan.suggestedPriceUsd} — {campaign.suggestedPlan.priceRationale}
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
              {(campaign.suggestedPlan.deliverables || []).map((d, i) => (
                <li key={i}>
                  {d.quantity}× {d.type}: {d.description}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-500">Either side can approve first; the campaign goes active after both approve.</p>
            {campaign.approvals?.influencerPlan && !campaign.approvals?.businessPlan && (
              <p className="mt-2 rounded-lg bg-pink-50 px-3 py-2 text-sm text-pink-900">You approved. Waiting for the business.</p>
            )}
            {!campaign.approvals?.influencerPlan && campaign.approvals?.businessPlan && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">The business approved. Please confirm below.</p>
            )}
            <button
              type="button"
              disabled={campaign.approvals?.influencerPlan}
              onClick={approvePlan}
              className="mt-4 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {campaign.approvals?.influencerPlan ? "Plan approved (you)" : "Approve plan (influencer)"}
            </button>
          </section>
        )}

        {campaign.status === STATUS.ACTIVE && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0A2540]">Submit deliverable</h2>
            <p className="mt-1 text-sm text-gray-600">Post link or asset URL for the business to review.</p>
            <input
              value={submitUrl}
              onChange={(e) => setSubmitUrl(e.target.value)}
              className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="https://instagram.com/p/…"
            />
            <button type="button" onClick={submitContent} className="mt-3 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white">
              Submit for review
            </button>
          </section>
        )}

        {campaign.status === STATUS.CONTENT_SUBMITTED && (
          <section className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
            <h2 className="font-semibold text-amber-900">Submitted</h2>
            <p className="mt-1 text-sm text-amber-900">Waiting for business approval of your deliverable.</p>
            <a href={campaign.submittedContent} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-pink-700 underline">
              {campaign.submittedContent}
            </a>
          </section>
        )}

        {campaign.status === STATUS.COMPLETED && (
          <section className="rounded-2xl border border-green-100 bg-green-50 p-6 shadow-sm">
            <h2 className="font-semibold text-green-900">Completed</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{campaign.resultsSummary}</p>
          </section>
        )}

        {(campaign.status === STATUS.INFLUENCER_REJECTED ||
          campaign.status === STATUS.NEED_DETAILS ||
          campaign.status === STATUS.INFLUENCER_COUNTER) && (
          <section className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-700">
            {campaign.status === STATUS.INFLUENCER_REJECTED && <p>You declined this collaboration.</p>}
            {campaign.status === STATUS.NEED_DETAILS && <p>You asked for more details. The business may follow up from their dashboard.</p>}
            {campaign.status === STATUS.INFLUENCER_COUNTER && (
              <p>
                Counter offer recorded. The business can propose an updated plan; once everyone aligns, they can attach a new AI plan from
                their side.
              </p>
            )}
          </section>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-[#0A2540]">Timeline</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {(campaign.timeline || []).map((t, i) => (
              <li key={i}>
                <span className="text-xs text-gray-400">{new Date(t.at).toLocaleString()}</span> — {t.label}{" "}
                <span className="text-xs">({t.actor})</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
