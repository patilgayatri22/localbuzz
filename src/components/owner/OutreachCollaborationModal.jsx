"use client";

import { useMemo, useState } from "react";
import { buildOutreachDm, CAMPAIGN_TYPES, instagramProfileUrl } from "@/lib/outreachDm";
import { appendNegotiationMessage } from "@/lib/outreachNegotiationStorage";

const CAMPAIGN_OPTIONS = [
  {
    id: CAMPAIGN_TYPES.affiliate,
    title: "Affiliate campaign",
    icon: "🛒",
    description: "Pay influencers a commission (% or fixed amount) for each sale they drive.",
    footer: "Best when you can share a simple tracking link or promo code.",
    comingSoon: false,
  },
  {
    id: CAMPAIGN_TYPES.paid_collab,
    title: "Paid collaboration",
    icon: "🤝",
    description: "Pay a fixed fee for agreed deliverables (reel, stories, post).",
    footer: "Great for launches, seasonal pushes, and one-off campaigns.",
    comingSoon: false,
  },
  {
    id: CAMPAIGN_TYPES.hybrid,
    title: "Paid collab + affiliate",
    icon: "📈",
    description: "Combine an upfront fee with performance-based commission.",
    footer: "Full workflow coming soon on LocalBuzz.",
    comingSoon: true,
  },
  {
    id: CAMPAIGN_TYPES.gifting,
    title: "Product gifting & seeding",
    icon: "🎁",
    description: "Send product or service credits in exchange for authentic posts.",
    footer: "Logistics and tracking coming soon on LocalBuzz.",
    comingSoon: true,
  },
];

export default function OutreachCollaborationModal({ open, onClose, influencer, business, campaignType, onCampaignTypeChange, onSendToChat }) {
  const [copied, setCopied] = useState(false);
  const dm = useMemo(
    () => (influencer && business ? buildOutreachDm(influencer, business, campaignType) : ""),
    [influencer, business, campaignType]
  );

  const igUrl = useMemo(() => (influencer ? instagramProfileUrl(influencer.handle) : "https://www.instagram.com/"), [influencer]);

  const copyDm = async () => {
    try {
      await navigator.clipboard.writeText(dm);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const sendToChats = () => {
    if (!influencer?.id || !dm.trim()) return;
    appendNegotiationMessage(influencer.id, { from: "owner", text: dm.trim() });
    onSendToChat?.(influencer.id);
    onClose();
  };

  if (!open || !influencer || !business) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true">
        <h3 className="text-lg font-bold text-[#0A2540]">AI outreach DM</h3>
        <p className="mt-1 text-xs text-[#425466]">Personalized with your name and business — not a one-size template.</p>
        <p className="mt-2 rounded-lg bg-[#F0EDFF]/60 px-3 py-2 text-xs text-[#425466]">
          💬 Negotiate in the <strong className="text-[#0A2540]">Chats</strong> button (top-right) — sample threads are included for demo creators.
        </p>
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 font-sans text-sm leading-relaxed text-[#0A2540]">{dm}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyDm}
            className="rounded-xl bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4F46E5]"
          >
            {copied ? "Copied" : "Copy DM"}
          </button>
          <button
            type="button"
            onClick={sendToChats}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Send message
          </button>
          <a href={igUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600">
            Open Instagram
          </a>
          <button type="button" onClick={onClose} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-[#0A2540]">
            Close
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            onSendToChat?.(influencer.id);
            onClose();
          }}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-[#E3E8EE] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#635BFF] hover:border-[#635BFF]"
        >
          💬 Open chats
        </button>

        <div className="mt-8 border-t border-[#E3E8EE] pt-6">
          <h4 className="text-sm font-semibold uppercase tracking-[0.06em] text-[#8898AA]">Collaboration type</h4>
          <p className="mt-1 text-sm text-[#425466]">Select how you want to work together — your DM offer line updates for paid vs affiliate (demo).</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CAMPAIGN_OPTIONS.map((opt) => {
              const selected = campaignType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={opt.comingSoon}
                  onClick={() => !opt.comingSoon && onCampaignTypeChange(opt.id)}
                  className={`relative rounded-xl border-2 p-4 text-left transition ${
                    opt.comingSoon
                      ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-75"
                      : selected
                        ? "border-[#635BFF] bg-[#F0EDFF]/50 shadow-[0_0_0_3px_rgba(99,91,255,0.12)]"
                        : "border-[#E3E8EE] bg-white hover:border-[#635BFF]/40"
                  }`}
                >
                  {opt.comingSoon && (
                    <span className="absolute right-2 top-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Coming soon
                    </span>
                  )}
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#F6F9FC] text-lg">{opt.icon}</div>
                  <p className="font-semibold text-[#0A2540]">{opt.title}</p>
                  <p className="mt-1 text-xs text-[#425466]">{opt.description}</p>
                  <p className="mt-2 text-[11px] text-[#8898AA]">{opt.footer}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-3">
          <p className="text-xs text-[#425466]">After selecting collaboration type, save this DM to the chat thread.</p>
          <button
            type="button"
            onClick={sendToChats}
            className="mt-2 w-full rounded-xl bg-[#0A2540] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#102f4d]"
          >
            Use selected collaboration + send DM to chat
          </button>
        </div>
      </div>
    </div>
  );
}
