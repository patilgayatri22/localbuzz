"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function InfluencerSidebar() {
  const pathname = usePathname();
  const links = [
    ["🏠 Dashboard", "/influencer/dashboard"],
    ["💼 Opportunities", "/influencer/opportunities"],
    ["📬 Campaign requests", "/influencer/campaigns"],
  ];

  return (
    <aside className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-bold text-pink-500">Creator Hub ✨</h2>
      <div className="space-y-2">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={`block rounded-xl px-3 py-2 text-sm ${
              pathname === href || pathname?.startsWith(`${href}/`)
                ? "bg-pink-100 font-medium text-pink-700"
                : "bg-gray-50 hover:bg-pink-50"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
