"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveOwnerUser, setOwnerSession } from "@/lib/localAuth";

const types = [
  "Restaurant",
  "Nail Salon",
  "Coffee Shop",
  "Bakery",
  "Spa",
  "Retail Store",
  "Gym",
  "Hair Salon",
  "Food Truck",
  "Health & Wellness",
];
const languages = ["English", "Spanish", "Chinese", "Vietnamese"];

export default function OwnerSignupPage() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState(["English"]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();
  const progress = useMemo(() => (step / 4) * 100, [step]);

  /* URL ?demo=wellness — apply after mount so SSR and first client paint stay aligned (no hydration mismatch). */
  /* eslint-disable react-hooks/set-state-in-effect -- one-shot URL query seed */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("demo") !== "wellness") return;
    setSelectedType("Health & Wellness");
    setBusinessName("GreenLeaf Wellness Studio");
    setCity("Berkeley, CA");
    setNeighborhood("North Berkeley");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const completeSetup = () => {
    const userRecord = {
      fullName: fullName || "Business Owner",
      email: email || "owner@localbuzz.app",
      password: password || "demo123",
      business_name: businessName || "My Local Business",
      business_type: selectedType || "Health & Wellness",
      location: city || "Berkeley, CA",
      neighborhood: neighborhood || "",
      phone: phone || "",
      language: selectedLanguages[0] || "English",
      address: street || "",
    };
    saveOwnerUser(userRecord);
    setOwnerSession({
      email: userRecord.email,
      role: "owner",
      business_name: userRecord.business_name,
      fullName: userRecord.fullName,
    });
    router.push("/owner/dashboard");
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[#0A2540]">Owner Signup</h1>
        <p className="text-sm text-[#425466]">Step {step} of 4</p>
      </div>
      <div className="mb-8 h-2 rounded-full bg-[#E3E8EE]">
        <div className="h-2 rounded-full bg-[#635BFF] transition-all" style={{ width: `${progress}%` }} />
      </div>
      <section className="rounded-xl border border-[#E3E8EE] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Create your free account</h2>
            <p className="text-[#425466]">Start marketing your business in minutes.</p>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Full name" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Email address" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Password" type="password" />
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold">Tell us about your business</h2>
            <p className="mb-4 text-[#425466]">We&apos;ll personalize everything for you.</p>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mb-3 h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Business name" />
            <div className="grid gap-3 md:grid-cols-3">
              {types.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`rounded-lg border p-3 text-left text-sm ${selectedType === type ? "border-[#635BFF] bg-[#F0EDFF]" : "border-[#E3E8EE] hover:border-[#635BFF]"}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input value={street} onChange={(e) => setStreet(e.target.value)} className="h-11 rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Street address" />
              <input value={city} onChange={(e) => setCity(e.target.value)} className="h-11 rounded-[6px] border border-[#E3E8EE] px-3" placeholder="City" />
              <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="h-11 rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Neighborhood (optional)" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-[6px] border border-[#E3E8EE] px-3" placeholder="Business phone" />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Add your customer list</h2>
            <p className="text-[#425466]">We&apos;ll use this to send campaigns on your behalf.</p>
            <div className="rounded-lg border-2 border-dashed border-[#E3E8EE] p-6 text-center">
              📧 Upload customer email list (.csv, .xlsx, .txt)
            </div>
            <textarea className="w-full rounded-[6px] border border-[#E3E8EE] p-3 text-sm" rows={4} placeholder="Add emails manually, one per line" />
            <div className="rounded-lg border-2 border-dashed border-[#E3E8EE] p-6 text-center">
              📱 Upload customer phone numbers (optional for later SMS)
            </div>
            <p className="text-sm text-[#8898AA]">🔒 Your data is encrypted and never shared with third parties.</p>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Almost done!</h2>
            <p className="text-[#425466]">Set your preferences.</p>
            <div className="grid gap-3 md:grid-cols-4">
              {languages.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() =>
                    setSelectedLanguages((prev) =>
                      prev.includes(language) ? prev.filter((v) => v !== language) : [...prev, language]
                    )
                  }
                  className={`rounded-lg border p-3 text-sm ${selectedLanguages.includes(language) ? "border-[#635BFF] bg-[#F0EDFF]" : "border-[#E3E8EE]"}`}
                >
                  {language}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["Beauty", "Food", "Fashion", "Wellness", "Fitness", "Lifestyle", "Local favorite"].map((tag) => (
                <button key={tag} type="button" className="rounded-full border border-[#E3E8EE] px-3 py-1 text-xs hover:border-[#635BFF]">
                  {tag}
                </button>
              ))}
            </div>
            <p className="rounded-lg bg-[#F6F9FC] p-3 text-sm">✅ Email responses • ✅ Weekly suggestions • ✅ Event alerts</p>
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
            <button onClick={completeSetup} className="h-11 rounded-[6px] bg-[#635BFF] px-6 text-sm font-semibold text-white hover:bg-[#4F46E5]">
              Complete Setup →
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
