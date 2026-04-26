"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOwnerUsers, getInfluencerUsers, setOwnerSession, setInfluencerSession } from "@/lib/localAuth";

export default function SignInPage() {
  const [role, setRole] = useState("owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const submit = (e) => {
    e.preventDefault();
    if (role === "owner") {
      const users = getOwnerUsers();
      const matched = users.find(
        (user) => user.email?.toLowerCase() === email.toLowerCase() && user.password === password
      );
      if (matched) {
        setOwnerSession({
          email: matched.email,
          role: "owner",
          business_name: matched.business_name,
          fullName: matched.fullName,
        });
        router.push("/owner/dashboard");
        return;
      }
      router.push("/signup/owner");
      return;
    }
    const infUsers = getInfluencerUsers();
    const infMatch = infUsers.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (infMatch) {
      setInfluencerSession({
        email: infMatch.email,
        creatorId: infMatch.creatorId,
        fullName: infMatch.fullName,
        role: "influencer",
      });
      router.push("/influencer/campaigns");
      return;
    }
    router.push("/signup/influencer");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="bg-[#0A2540] p-10 text-white">
        <p className="text-xl font-bold">LocalBuzz 🌟</p>
        <h1 className="mt-10 text-5xl font-bold leading-tight">Marketing made simple</h1>
        <ul className="mt-6 space-y-3 text-[#c5d2df]">
          <li>✓ Generate posts in seconds</li>
          <li>✓ Find local influencers</li>
          <li>✓ Reach all your customers</li>
        </ul>
        <div className="mt-10 rounded-xl border border-white/20 bg-white/10 p-4">
          <p className="text-sm">Buzz AI can turn one line into complete multi-channel campaigns.</p>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-white p-6">
        <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-[#E3E8EE] p-8 shadow-[0_8px_24px_rgba(149,157,165,0.2)]">
          <h2 className="text-3xl font-semibold text-[#0A2540]">Welcome to LocalBuzz</h2>
          <div className="mt-6 flex border-b border-[#E3E8EE]">
            <button type="button" onClick={() => setRole("owner")} className={`px-3 py-2 text-sm ${role === "owner" ? "border-b-2 border-[#635BFF] text-[#0A2540]" : "text-[#8898AA]"}`}>
              🏪 Business Owner
            </button>
            <button type="button" onClick={() => setRole("influencer")} className={`px-3 py-2 text-sm ${role === "influencer" ? "border-b-2 border-[#635BFF] text-[#0A2540]" : "text-[#8898AA]"}`}>
              ⭐ Influencer
            </button>
          </div>

          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="mt-6 h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3 text-sm focus:border-[#635BFF] focus:outline-none focus:ring-4 focus:ring-[#635BFF]/15" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="mt-3 h-11 w-full rounded-[6px] border border-[#E3E8EE] px-3 text-sm focus:border-[#635BFF] focus:outline-none focus:ring-4 focus:ring-[#635BFF]/15" />

          <button className="mt-4 h-11 w-full rounded-[6px] bg-[#635BFF] text-sm font-semibold text-white hover:bg-[#4F46E5]">
            Continue →
          </button>
          <p className="my-4 text-center text-sm text-[#8898AA]">or</p>
          <button type="button" className="h-11 w-full rounded-[6px] border border-[#E3E8EE] text-sm text-[#0A2540]">
            Continue with Google
          </button>
          <p className="mt-4 text-sm text-[#425466]">
            Don&apos;t have an account?{" "}
            <Link href={role === "owner" ? "/signup/owner" : "/signup/influencer"} className="text-[#635BFF]">
              Sign up
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
