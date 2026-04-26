"use client";

import Link from "next/link";
import Sidebar from "@/components/owner/Sidebar";
import { listCampaignsForBusiness } from "@/lib/campaignStorage";
import { getOwnerSession } from "@/lib/localAuth";
import { useMemo, useState } from "react";

export default function OwnerCampaignsPage() {
  const [email] = useState(() => getOwnerSession()?.email || "");
  const campaigns = useMemo(() => listCampaignsForBusiness(email), [email]);

  return (
    <div className="grid gap-4 bg-[#F6F9FC] p-4 lg:grid-cols-[240px_1fr]">
      <Sidebar />
      <main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div>
            <h1 className="text-2xl font-semibold text-[#0A2540]">Collaboration campaigns</h1>
            <p className="text-sm text-[#425466]">AI-assisted workflow — you approve every send, deal, and deliverable.</p>
          </div>
          <Link
            href="/owner/campaigns/new"
            className="rounded-[6px] bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4F46E5]"
          >
            New campaign
          </Link>
        </div>

        <div className="space-y-3">
          {campaigns.length === 0 && (
            <p className="rounded-xl border border-[#E3E8EE] bg-white p-8 text-center text-sm text-[#425466]">
              No campaigns yet. Start one to match with an influencer and send a structured request.
            </p>
          )}
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/owner/campaigns/${c.id}`}
              className="block rounded-xl border border-[#E3E8EE] bg-white p-4 shadow-sm transition hover:border-[#635BFF]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-[#0A2540]">{c.title}</h2>
                <span className="rounded-full bg-[#F0EDFF] px-2 py-0.5 text-xs font-medium text-[#635BFF]">{c.status}</span>
              </div>
              <p className="mt-1 text-xs text-[#8898AA]">Influencer: {c.influencerName || c.influencerId}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
