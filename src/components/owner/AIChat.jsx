"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import QuickPrompts from "@/components/shared/QuickPrompts";
import { askBuzz } from "@/lib/geminiAPI";
import {
  buildFallbackBuzz,
  coerceBuzzToCanonical,
  friendlyBuzzIntro,
  normalizeBusinessForBuzz,
  parseBuzzJson,
  replyTextLooksLikeBuzzJson,
  stripEchoedUserInstruction,
} from "@/lib/prompts/buzzGemini";

export default function AIChat({ business, onBuzzResponse }) {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hi! I am Buzz 🤖. What are we promoting today?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const urlPromptDone = useRef(false);

  const send = async (content) => {
    if (!content.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: content }]);
    setInput("");
    setLoading(true);
    try {
      const data = await askBuzz({ message: content, business });
      const profile = normalizeBusinessForBuzz(business || {});
      let reply = typeof data.replyText === "string" && data.replyText.trim() ? data.replyText.trim() : friendlyBuzzIntro(profile);

      let buzzPayload = data.buzz && typeof data.buzz === "object" ? data.buzz : null;

      if (replyTextLooksLikeBuzzJson(reply)) {
        const parsed = parseBuzzJson(reply);
        const fromReply = parsed ? coerceBuzzToCanonical(parsed, profile, content) : null;
        if (fromReply) buzzPayload = fromReply;
        reply = friendlyBuzzIntro(profile);
      } else if (reply.length > 6000 && reply.trim().startsWith("{")) {
        reply = friendlyBuzzIntro(profile);
      }

      if (buzzPayload) {
        buzzPayload = coerceBuzzToCanonical(buzzPayload, profile, content) ?? buzzPayload;
      }
      if (!buzzPayload?.variations?.length) {
        buzzPayload = buildFallbackBuzz(profile, content);
      }

      if (buzzPayload?.variations?.length) {
        buzzPayload = {
          ...buzzPayload,
          variations: buzzPayload.variations.map((v) => ({
            ...v,
            caption: stripEchoedUserInstruction(v.caption, content),
          })),
        };
      }

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);

      if (buzzPayload && typeof onBuzzResponse === "function") {
        onBuzzResponse(buzzPayload);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Sorry, ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (!prompt || urlPromptDone.current) return;
    urlPromptDone.current = true;
    send(decodeURIComponent(prompt));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot URL prompt
  }, [searchParams]);

  return (
    <div className="flex h-[75vh] flex-col rounded-xl border border-[#E3E8EE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-lg font-semibold text-[#0A2540]">Buzz 🤖</span>
        <span className="rounded-full bg-[#F0EDFF] px-2 py-0.5 text-[11px] font-medium text-[#635BFF]">Gemini</span>
      </div>
      <div className="mb-3 flex-1 space-y-2 overflow-y-auto rounded-[8px] bg-[#F6F9FC] p-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              m.role === "user" ? "ml-auto bg-[#635BFF] text-white [border-radius:18px_18px_4px_18px]" : "bg-white text-[#0A2540] shadow-sm [border-radius:18px_18px_18px_4px]"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-xs text-[#8898AA]">Buzz is thinking...</div>}
      </div>
      <QuickPrompts onPick={(prompt) => setInput(prompt)} />
      <div className="flex gap-2 border-t border-[#E3E8EE] pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell Buzz your goal..."
          className="flex-1 rounded-[6px] border border-[#E3E8EE] px-3 py-2 text-sm text-[#0A2540] placeholder:text-[#8898AA] focus:border-[#635BFF] focus:outline-none focus:ring-4 focus:ring-[#635BFF]/15"
          onKeyDown={(e) => e.key === "Enter" && send(input)}
        />
        <button
          type="button"
          onClick={() => send(input)}
          className="rounded-[6px] bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4F46E5]"
        >
          Send
        </button>
      </div>
    </div>
  );
}
