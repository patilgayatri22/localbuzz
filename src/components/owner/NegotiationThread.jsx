"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { appendNegotiationMessage, getNegotiationThread } from "@/lib/outreachNegotiationStorage";

const DEMO_REPLIES = [
  "Thanks for reaching out! What timeline are you thinking for the post?",
  "Love the direction — could you share a rough budget range for this collab?",
  "Sounds good! What deliverables did you have in mind (reel vs stories)?",
  "Appreciate the note. Is the offer flexible if we bundle an extra story?",
];

export default function NegotiationThread({ creatorId, creatorFirstName, onActivity }) {
  const [threadTick, setThreadTick] = useState(0);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const messages = useMemo(() => {
    void threadTick;
    return getNegotiationThread(creatorId);
  }, [creatorId, threadTick]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendOwner = () => {
    const text = input.trim();
    if (!text || !creatorId) return;
    appendNegotiationMessage(creatorId, { from: "owner", text });
    setThreadTick((t) => t + 1);
    onActivity?.();
    setInput("");
    const next = getNegotiationThread(creatorId);
    const ownerTurns = next.filter((m) => m.from === "owner").length;
    window.setTimeout(() => {
      const reply = DEMO_REPLIES[(ownerTurns - 1) % DEMO_REPLIES.length];
      appendNegotiationMessage(creatorId, { from: "influencer", text: reply });
      setThreadTick((t) => t + 1);
      onActivity?.();
    }, 900);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="mb-2 text-xs text-[#425466]">
        Thread with <span className="font-semibold text-[#0A2540]">{creatorFirstName}</span> — saved in this browser only. Influencer replies are simulated for demo.
      </p>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg border border-[#E3E8EE] bg-white p-3">
        {messages.length === 0 && <p className="text-xs text-[#8898AA]">Say hi to start the thread…</p>}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm ${
              m.from === "owner" ? "ml-auto bg-[#635BFF] text-white" : "bg-gray-100 text-[#0A2540]"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a message…"
          className="min-w-0 flex-1 rounded-lg border border-[#E3E8EE] px-3 py-2 text-sm"
          onKeyDown={(e) => e.key === "Enter" && sendOwner()}
        />
        <button type="button" onClick={sendOwner} className="shrink-0 rounded-lg bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white">
          Send
        </button>
      </div>
    </div>
  );
}
