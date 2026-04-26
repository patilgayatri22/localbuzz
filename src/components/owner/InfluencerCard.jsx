"use client";

import { instagramProfileUrl } from "@/lib/outreachDm";

export default function InfluencerCard({ influencer, onGenerateDm }) {
  const initials = influencer.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-600">{initials}</div>
        <div>
          <p className="font-semibold">{influencer.name}</p>
          <p className="text-sm text-gray-500">{influencer.handle}</p>
        </div>
      </div>
      <p className="text-sm">📍 {influencer.location}</p>
      <p className="text-sm">👥 {influencer.followers.toLocaleString()} followers</p>
      <p className="text-sm">💫 {influencer.engagement}% engagement</p>
      <p className="text-sm">🏷️ {influencer.niches.join(" • ")}</p>
      <p className="text-sm">💰 {influencer.budget}/post</p>
      <p className="text-sm">🎯 {influencer.match}% match</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => onGenerateDm(influencer)} className="rounded-xl bg-[#635BFF] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4F46E5]">
          Get AI DM
        </button>
        <a
          href={instagramProfileUrl(influencer.handle)}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-[#E3E8EE] bg-white px-3 py-2 text-xs font-semibold text-[#0A2540] hover:bg-[#F6F9FC]"
        >
          View on Instagram
        </a>
      </div>
    </article>
  );
}
