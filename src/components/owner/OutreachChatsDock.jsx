"use client";

import { useEffect, useMemo, useState } from "react";
import NegotiationThread from "@/components/owner/NegotiationThread";
import { influencers } from "@/lib/demoData";
import { getNegotiationThread } from "@/lib/outreachNegotiationStorage";

export default function OutreachChatsDock({ openTick = 0, initialActiveId = null }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [listTick, setListTick] = useState(0);

  useEffect(() => {
    if (!openTick) return;
    const id = window.setTimeout(() => {
      setOpen(true);
      setActiveId(initialActiveId || null);
      setListTick((t) => t + 1);
    }, 0);
    return () => window.clearTimeout(id);
  }, [openTick, initialActiveId]);

  const rows = useMemo(() => {
    void listTick;
    return influencers.map((inf) => {
      const thread = getNegotiationThread(inf.id);
      const last = thread[thread.length - 1];
      return {
        id: inf.id,
        name: inf.name,
        first: inf.name.split(/\s+/)[0],
        preview: last?.text?.slice(0, 72) || "No messages yet — open to start.",
        count: thread.length,
      };
    });
  }, [listTick]);

  const active = rows.find((r) => r.id === activeId);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setListTick((t) => t + 1);
          setOpen(true);
        }}
        className="fixed right-4 top-24 z-[60] flex items-center gap-2 rounded-full border border-[#E3E8EE] bg-white px-4 py-2.5 text-sm font-semibold text-[#0A2540] shadow-[0_4px_20px_rgba(10,37,64,0.12)] transition hover:border-[#635BFF] hover:text-[#635BFF] md:top-28"
      >
        <span aria-hidden>💬</span>
        Chats
        <span className="rounded-full bg-[#635BFF] px-2 py-0.5 text-[11px] font-bold text-white">{rows.filter((r) => r.count > 0).length}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/30" role="presentation" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <aside
            className="flex h-full w-full max-w-md flex-col border-l border-[#E3E8EE] bg-white shadow-2xl"
            role="dialog"
            aria-label="Influencer chats"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E3E8EE] px-4 py-3">
              <h2 className="text-lg font-semibold text-[#0A2540]">Influencer chats</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-sm text-[#425466] hover:bg-[#F6F9FC]">
                Close
              </button>
            </div>

            {!activeId ? (
              <div className="flex-1 overflow-y-auto p-3">
                <p className="mb-3 text-xs text-[#425466]">Sample threads are pre-loaded for demo creators. Your real DMs sync here after you use &quot;Get AI DM&quot;.</p>
                <ul className="space-y-2">
                  {rows.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(r.id)}
                        className="w-full rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-3 text-left transition hover:border-[#635BFF]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#0A2540]">{r.name}</span>
                          {r.count > 0 && (
                            <span className="shrink-0 rounded-full bg-[#635BFF] px-2 py-0.5 text-[10px] font-bold text-white">{r.count}</span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-[#425466]">{r.preview}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(null);
                    setListTick((t) => t + 1);
                  }}
                  className="mb-3 self-start text-sm text-[#635BFF] hover:underline"
                >
                  ← All chats
                </button>
                <h3 className="text-base font-semibold text-[#0A2540]">Negotiate with {active?.first}</h3>
                <div className="mt-3 min-h-0 flex-1">
                  <NegotiationThread
                    creatorId={activeId}
                    creatorFirstName={active?.first || "creator"}
                    onActivity={() => setListTick((t) => t + 1)}
                  />
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
