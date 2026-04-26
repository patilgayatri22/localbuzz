"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["🏠 Home", "/owner/dashboard"],
  ["🤖 AI Assistant", "/owner/ai-assistant"],
  ["🤝 Collaboration campaigns", "/owner/campaigns"],
  ["📅 Local Events", "/owner/events"],
  ["👤 Find Influencers", "/owner/influencers"],
  ["📧 Send Campaign", "/owner/campaign"],
  ["📊 My Posts", "/owner/posts"],
  ["⚙️ Settings", "/owner/settings"],
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-full max-w-xs flex-col rounded-xl border border-[#E3E8EE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] lg:min-h-[80vh]">
      <div className="mb-5 text-lg font-bold text-[#0A2540]">LocalBuzz 🌟</div>
      <nav className="space-y-1">
        {items.map(([label, href]) => {
          const active = pathname === href || (href === "/owner/campaigns" && pathname?.startsWith("/owner/campaigns"));
          return (
          <Link
            key={href}
            href={href}
            className={`block rounded-[8px] px-3 py-2 text-sm transition ${
              active
                ? "border-l-2 border-[#635BFF] bg-[#F6F9FC] text-[#0A2540]"
                : "text-[#425466] hover:bg-[#F6F9FC]"
            }`}
          >
            {label}
          </Link>
        );
        })}
      </nav>
      <div className="mt-auto rounded-lg bg-[#F6F9FC] p-3">
        <p className="text-sm font-semibold text-[#0A2540]">Owner Account</p>
        <p className="text-xs text-[#8898AA]">Signed in from LocalBuzz</p>
      </div>
    </aside>
  );
}
