"use client";

import { useEffect, useRef, useState } from "react";
import { sendResendCampaign } from "@/lib/resendAPI";

export default function CampaignSender({ business }) {
  const [mode, setMode] = useState("email");
  const [subject, setSubject] = useState("A special thank-you");
  const seededSubject = useRef(false);

  useEffect(() => {
    if (business?.business_name && !seededSubject.current) {
      setSubject(`A special thank-you from ${business.business_name}`);
      seededSubject.current = true;
    }
  }, [business?.business_name]);
  const [emailBody, setEmailBody] = useState(
    "Hey there! Quick thank-you from us - this weekend only, enjoy 15% off your next visit. If you want it, just reply to this message and we will reserve your spot."
  );
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [suggestionsSource, setSuggestionsSource] = useState("");

  const sendNow = async () => {
    setSending(true);
    setResult(null);
    try {
      const emailRes = await sendResendCampaign({
        emails: business.customer_emails,
        businessName: business.business_name,
        subject,
        body: emailBody,
      });
      setResult({ emailRes });
    } finally {
      setSending(false);
    }
  };

  const loadCalendarSuggestions = async () => {
    setSuggestionsLoading(true);
    setSuggestionsError("");
    try {
      const res = await fetch("/api/campaign/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not generate suggestions.");
      setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
      setSuggestionsSource(data?.source || "");
    } catch (e) {
      setSuggestionsError(e?.message || "Could not generate suggestions.");
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const applySuggestion = (s) => {
    setSubject(s.subject || "");
    setEmailBody(s.body || "");
    setResult(null);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold">Compose</h2>
        <div className="mb-3 rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#0A2540]">AI calendar campaign ideas</p>
            <button
              type="button"
              onClick={loadCalendarSuggestions}
              disabled={suggestionsLoading}
              className="rounded-lg bg-[#635BFF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {suggestionsLoading ? "Generating..." : "Suggest offers"}
            </button>
          </div>
          <p className="mt-1 text-xs text-[#425466]">Uses AI + current calendar context (seasons/upcoming days), not random ideas.</p>
          {suggestionsError ? <p className="mt-2 text-xs text-red-600">{suggestionsError}</p> : null}
          {suggestions.length ? (
            <div className="mt-3 space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="w-full rounded-lg border border-[#E3E8EE] bg-white p-2.5 text-left hover:border-[#635BFF]"
                >
                  <p className="text-sm font-semibold text-[#0A2540]">{s.title}</p>
                  <p className="text-xs text-[#425466]">
                    {s.window} · {s.channelHint}
                  </p>
                  <p className="mt-1 text-xs text-[#667085]">{s.reason}</p>
                </button>
              ))}
              <p className="text-[11px] text-[#8898AA]">Source: {suggestionsSource === "gemini" ? "AI-generated from calendar context" : "Smart calendar fallback"}</p>
            </div>
          ) : null}
        </div>
        <div className="mb-3 flex gap-2 text-sm">
          {["email", "sms", "both"].map((value) => (
            <button
              key={value}
              className={`rounded-full px-3 py-1 ${mode === value ? "bg-indigo-500 text-white" : "bg-gray-100"} ${value !== "email" ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={() => value === "email" && setMode(value)}
              disabled={value !== "email"}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="mb-3 rounded-xl bg-amber-100 px-3 py-2 text-xs text-amber-800">
          SMS is currently disabled. Campaigns are email-only for now.
        </p>
        <input className="mb-2 w-full rounded-xl border p-2 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea className="mb-2 w-full rounded-xl border p-2 text-sm" rows={6} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
        <button onClick={sendNow} disabled={sending} className="mt-3 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">
          {sending ? "Sending..." : "Send Now"}
        </button>
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold">Preview</h2>
        <p className="text-sm font-semibold">{subject}</p>
        <p className="mb-3 text-sm">{emailBody}</p>
        <p className="mt-3 text-sm">📧 {business.customer_emails.length} customer emails</p>
        <p className="text-sm text-gray-500">📱 SMS temporarily disabled</p>
        {result && <p className="mt-3 rounded-xl bg-green-100 p-2 text-sm">🎉 Campaign sent successfully!</p>}
      </section>
    </div>
  );
}
