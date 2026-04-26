"use client";

import { Suspense, useEffect, useState } from "react";
import Sidebar from "@/components/owner/Sidebar";
import AIChat from "@/components/owner/AIChat";
import ContentPreview from "@/components/owner/ContentPreview";
import { loadMergedOwnerBusiness } from "@/lib/ownerBusinessProfile";

export default function AIAssistantPage() {
  const [business, setBusiness] = useState(null);
  const [profileReady, setProfileReady] = useState(false);
  const [buzz, setBuzz] = useState(null);
  const [buzzVersion, setBuzzVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const merged = await loadMergedOwnerBusiness();
      if (cancelled) return;
      setBusiness(merged);
      setProfileReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBuzz = (next) => {
    setBuzz(next);
    setBuzzVersion((v) => v + 1);
  };

  return (
    <div className="grid gap-4 bg-[#F6F9FC] p-4 lg:grid-cols-[240px_1fr]">
      <Sidebar />
      <main className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        {!profileReady || !business ? (
          <div className="flex h-[75vh] items-center justify-center rounded-xl border border-[#E3E8EE] bg-white text-sm text-[#8898AA] xl:col-span-2">
            Loading your business profile…
          </div>
        ) : (
          <>
            <Suspense
              fallback={
                <div className="flex h-[75vh] items-center justify-center rounded-xl border border-[#E3E8EE] bg-white text-sm text-[#8898AA]">
                  Loading Buzz…
                </div>
              }
            >
              <AIChat business={business} onBuzzResponse={handleBuzz} />
            </Suspense>
            <ContentPreview key={buzzVersion} buzz={buzz} emailCount={business.customer_emails?.length ?? 0} />
          </>
        )}
      </main>
    </div>
  );
}
