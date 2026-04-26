"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const businessTypes = ["Nail Salon", "Restaurant", "Coffee Shop", "Bakery", "Spa", "Retail Store", "Gym", "Hair Salon", "Food Truck", "Health & Wellness", "Other"];
const languages = ["English", "Spanish", "Chinese", "Vietnamese"];

export default function OwnerOnboardingPage() {
  const [step, setStep] = useState(1);
  const [emailCount, setEmailCount] = useState(47);
  const [phoneCount, setPhoneCount] = useState(32);
  const router = useRouter();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Owner Onboarding</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-2">
            <input className="w-full rounded-xl border p-2" placeholder="Business name" />
            <select className="w-full rounded-xl border p-2">{businessTypes.map((item) => <option key={item}>{item}</option>)}</select>
            <input className="w-full rounded-xl border p-2" placeholder="City + Neighborhood" />
            <input className="w-full rounded-xl border p-2" placeholder="Phone number" />
            <select className="w-full rounded-xl border p-2">{languages.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-2">
            <input className="w-full rounded-xl border p-2" placeholder="Paste customer emails" onChange={(e) => setEmailCount(Math.max(1, e.target.value.split(",").length))} />
            <input className="w-full rounded-xl border p-2" placeholder="Paste customer phone numbers" onChange={(e) => setPhoneCount(Math.max(1, e.target.value.split(",").length))} />
            <p className="text-sm text-gray-600">{emailCount} emails added, {phoneCount} numbers added</p>
          </div>
        )}
        {step === 3 && <p className="text-sm">Connect Buffer OAuth or skip for now.</p>}
        {step === 4 && <p className="text-sm">All done! Redirecting to dashboard.</p>}
        <div className="mt-4 flex gap-2">
          {step > 1 && <button onClick={() => setStep((s) => s - 1)} className="rounded-xl bg-gray-100 px-4 py-2">Back</button>}
          {step < 4 ? (
            <button onClick={() => setStep((s) => s + 1)} className="rounded-xl bg-indigo-500 px-4 py-2 text-white">Next</button>
          ) : (
            <button onClick={() => router.push("/owner/dashboard")} className="rounded-xl bg-green-500 px-4 py-2 text-white">Go to Dashboard</button>
          )}
        </div>
      </div>
    </main>
  );
}
