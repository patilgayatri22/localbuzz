"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const niches = [
  "Beauty & Nails",
  "Food & Dining",
  "Fashion & Style",
  "Wellness & Spa",
  "Fitness & Health",
  "Home & Lifestyle",
  "Family & Kids",
  "Culture & Community",
  "Coffee & Cafes",
  "Entertainment",
];

export default function InfluencerSignupPage() {
  const [step, setStep] = useState(1);
  const [selectedNiches, setSelectedNiches] = useState([]);
  const router = useRouter();
  const progress = useMemo(() => (step / 4) * 100, [step]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[#0A2540]">Influencer Signup</h1>
        <p className="text-sm text-[#425466]">Step {step} of 4</p>
      </div>
      <div className="mb-8 h-2 rounded-full bg-[#E3E8EE]">
        <div className="h-2 rounded-full bg-[#635BFF] transition-all" style={{ width: `${progress}%` }} />
      </div>

      <section className="rounded-xl border border-[#E3E8EE] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Join as an influencer</h2>
            <input className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Full name" />
            <input className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Email address" />
            <input className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Password" type="password" />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Build your creator profile</h2>
            <div className="h-24 w-24 rounded-full border-2 border-dashed border-[#E3E8EE] grid place-items-center">📷</div>
            <input className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Display name" />
            <input className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3" placeholder="@instagram_handle" />
            <textarea className="w-full rounded-[6px] border border-[#E3E8EE] p-3 text-sm" rows={3} maxLength={160} placeholder="Tell businesses what makes you unique..." />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Tell us about your audience</h2>
            <input type="range" min={1000} max={100000} defaultValue={8200} className="w-full" />
            <select className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3">
              <option>3-6% (good)</option>
              <option>1-3% (average)</option>
              <option>6-10% (great)</option>
            </select>
            <div className="grid gap-3 md:grid-cols-3">
              {niches.map((niche) => (
                <button
                  key={niche}
                  type="button"
                  onClick={() =>
                    setSelectedNiches((prev) =>
                      prev.includes(niche) ? prev.filter((n) => n !== niche) : prev.length < 3 ? [...prev, niche] : prev
                    )
                  }
                  className={`rounded-lg border p-3 text-left text-sm ${selectedNiches.includes(niche) ? "border-[#635BFF] bg-[#F0EDFF]" : "border-[#E3E8EE]"}`}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Set your collaboration terms</h2>
            <input type="range" min={0} max={500} defaultValue={80} className="w-full" />
            <div className="flex flex-wrap gap-2">
              {["Instagram feed post", "Instagram story", "Instagram reel", "TikTok video", "Blog post"].map((offer) => (
                <button key={offer} type="button" className="rounded-full border border-[#E3E8EE] px-3 py-1 text-xs hover:border-[#635BFF]">
                  {offer}
                </button>
              ))}
            </div>
            <p className="rounded-lg bg-[#F6F9FC] p-3 text-sm">✅ Available for new collaborations • ⚡ Response within 24 hours</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => (step === 1 ? router.push("/signin") : setStep((s) => Math.max(1, s - 1)))}
            className="text-sm text-[#425466]"
          >
            ← Back
          </button>
          {step < 4 ? (
            <button onClick={() => setStep((s) => Math.min(4, s + 1))} className="h-11 rounded-[6px] bg-[#635BFF] px-6 text-sm font-semibold text-white hover:bg-[#4F46E5]">
              Continue →
            </button>
          ) : (
            <button onClick={() => router.push("/influencer/dashboard")} className="h-11 rounded-[6px] bg-[#635BFF] px-6 text-sm font-semibold text-white hover:bg-[#4F46E5]">
              Complete Profile →
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
