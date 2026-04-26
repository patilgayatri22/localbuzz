"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/owner/Sidebar";
import { demoBusiness } from "@/lib/demoData";
import { getOwnerSession, getOwnerUsers } from "@/lib/localAuth";
import { seedWellnessDemoOwner } from "@/lib/wellnessDemoSeed";

const quickActions = [
  ["✍️ Create a Post", "/owner/ai-assistant"],
  ["👤 Find Influencers", "/owner/influencers"],
  ["📅 Local Events", "/owner/events"],
  ["📧 Send to Customers", "/owner/campaign"],
];

function readDashboardProfile() {
  if (typeof window === "undefined") {
    return { businessName: demoBusiness.business_name, ownerName: "Owner" };
  }
  const session = getOwnerSession();
  if (!session?.email) return { businessName: demoBusiness.business_name, ownerName: "Owner" };
  const user = getOwnerUsers().find((item) => item.email === session.email);
  return {
    businessName: user?.business_name || session.business_name || demoBusiness.business_name,
    ownerName: user?.fullName || session.fullName || "Owner",
  };
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [profileTick, setProfileTick] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("demo") !== "wellness") return;
    seedWellnessDemoOwner();
    router.replace("/owner/dashboard");
    queueMicrotask(() => setProfileTick((t) => t + 1));
  }, [router]);

  const profile = useMemo(() => {
    void profileTick;
    return readDashboardProfile();
  }, [profileTick]);

  const greeting = useMemo(() => `Good morning, ${profile.businessName}! 👋`, [profile.businessName]);

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      <header className="sticky top-0 z-30 border-b border-[#E3E8EE] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3">
          <p className="font-bold text-[#0A2540]">LocalBuzz 🌟</p>
          <div className="flex-1">
            <input
              placeholder="Search campaigns, posts, creators..."
              className="h-10 w-full max-w-xl rounded-[6px] bg-[#F6F9FC] px-3 text-sm outline-none ring-1 ring-transparent focus:ring-[#635BFF]/20"
            />
          </div>
          <button className="rounded-[6px] border border-[#E3E8EE] px-3 py-2 text-sm">🔔</button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#635BFF] text-sm font-semibold text-white">
            {profile.ownerName.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-4 p-4 lg:grid-cols-[240px_1fr]">
        <Sidebar />
        <main>
          <div className="mb-4 rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <h1 className="text-3xl font-semibold text-[#0A2540]">{greeting}</h1>
            <p className="mt-1 text-sm text-[#425466]">What would you like to do today?</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl border border-[#E3E8EE] bg-white p-6 text-lg font-semibold text-[#0A2540] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:border-[#635BFF]"
              >
                {label}
              </Link>
          ))}
          </div>
        </main>
      </div>
    </div>
  );
}
