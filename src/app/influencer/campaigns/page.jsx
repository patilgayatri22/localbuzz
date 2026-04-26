"use client";

import Link from "next/link";
import InfluencerSidebar from "@/components/influencer/InfluencerSidebar";
import { listCampaignsForInfluencer } from "@/lib/campaignStorage";
import { getInfluencerSession } from "@/lib/localAuth";

export default function InfluencerCampaignsPage() {
  const session = typeof window !== "undefined" ? getInfluencerSession() : null;
  const creatorId = session?.creatorId;
  const campaigns = creatorId ? listCampaignsForInfluencer(creatorId) : [];

  if (!session?.creatorId) {
    return (
      <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
        <InfluencerSidebar />
        <main className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#0A2540]">Campaign requests</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in as an influencer to see collaboration requests.</p>
          <Link href="/signin" className="mt-4 inline-block text-sm font-medium text-pink-600 underline">
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
      <InfluencerSidebar />
      <main className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#0A2540]">Campaign requests</h1>
        <p className="mt-1 text-sm text-gray-600">
          Signed in as <span className="font-medium">{session.fullName || session.email}</span>. Demo accounts:{" "}
          <span className="text-gray-500">sofia@localbuzz.demo / demo</span> (and jenny, marcus @localbuzz.demo).
        </p>

        <div className="mt-6 space-y-3">
          {campaigns.length === 0 && (
            <p className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-600">
              No requests yet. When a business sends a collaboration request to your creator profile, it appears here.
            </p>
          )}
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/influencer/campaigns/${c.id}`}
              className="block rounded-xl border border-gray-100 p-4 transition hover:border-pink-300 hover:bg-pink-50/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-[#0A2540]">{c.title}</h2>
                <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-800">{c.status}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{c.businessName || c.businessEmail}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
