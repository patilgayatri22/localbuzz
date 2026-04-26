"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { pollinationsImageUrl } from "@/lib/pollinationsAPI";

function InstagramGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={22} height={22} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 1-2.881 0 1.44 1.44 0 0 1 2.881 0z"
      />
    </svg>
  );
}

function ImageCard({ src, selected, onSelect, label }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const pending = !src;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={pending}
      className={`relative aspect-square w-full overflow-hidden rounded-[14px] border-2 text-left transition ${
        selected ? "border-[#635BFF] shadow-[0_0_0_3px_rgba(99,91,255,0.15)]" : "border-[#E3E8EE] hover:border-[#635BFF]/50"
      } ${pending ? "cursor-wait opacity-95" : ""}`}
    >
      {pending ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#EEF2F7] px-3" aria-busy>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#635BFF] border-t-transparent" aria-hidden />
          <span className="text-center text-xs font-medium text-[#425466]">Generating…</span>
        </div>
      ) : null}
      {!pending && !loaded && !failed && <div className="absolute inset-0 animate-pulse bg-[#E3E8EE]" aria-hidden />}
      {!pending && failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F6F9FC] px-3 text-center text-xs text-[#8898AA]">
          AI image did not load — try Upload yours or pick another angle.
        </div>
      ) : null}
      {!pending && !failed ? (
        <img
          src={src}
          alt={label}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(true);
          }}
        />
      ) : null}
      <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-1 text-[11px] text-white">{label}</span>
    </button>
  );
}

function UploadImageCard({ inputId, selected, previewUrl, onPickFile, onSelect }) {
  return (
    <div
      className={`relative flex aspect-square w-full flex-col overflow-hidden rounded-[14px] border-2 transition ${
        selected ? "border-[#635BFF] bg-[#F0EDFF]/30 shadow-[0_0_0_3px_rgba(99,91,255,0.12)]" : "border-dashed border-[#C9D4E3] bg-[#F9FBFF]"
      }`}
    >
      <label htmlFor={inputId} className="flex flex-1 cursor-pointer flex-col p-4 text-left">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#635BFF]">Your photo</span>
        <span className="mt-1 text-sm font-medium text-[#0A2540]">Upload yours</span>
        <span className="mt-1 text-xs text-[#425466]">Tap this square to choose from camera roll.</span>
        <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={onPickFile} />
      </label>
      {previewUrl ? (
        <button type="button" onClick={onSelect} className="relative block w-full border-t border-[#E3E8EE]">
          <img src={previewUrl} alt="Your upload" className="h-32 w-full object-cover" />
        </button>
      ) : null}
      <label
        htmlFor={inputId}
        className="cursor-pointer border-t border-[#E3E8EE] bg-white px-3 py-2.5 text-center text-sm font-semibold text-[#635BFF] hover:bg-[#F6F9FC]"
      >
        Choose file
      </label>
    </div>
  );
}

export default function ContentPreview({ buzz, emailCount }) {
  const [captionId, setCaptionId] = useState(null);
  const [aiImageIndex, setAiImageIndex] = useState(null);
  const [uploadObjectUrl, setUploadObjectUrl] = useState(null);
  const [useUploadImage, setUseUploadImage] = useState(false);
  const [accordion, setAccordion] = useState({ wa: false, email: false, sms: false });
  const [aiImageTiles, setAiImageTiles] = useState([]);
  const [imageProviderNote, setImageProviderNote] = useState("");

  useEffect(() => {
    return () => {
      if (uploadObjectUrl) URL.revokeObjectURL(uploadObjectUrl);
    };
  }, [uploadObjectUrl]);

  const variations = useMemo(() => buzz?.variations ?? [], [buzz]);
  const imageGenKey = useMemo(
    () =>
      variations
        .slice(0, 2)
        .map((v) => `${v.id ?? ""}|${v.angle ?? ""}|${v.imagePrompt ?? ""}`)
        .join("||"),
    [variations]
  );

  useEffect(() => {
    const slice = variations.slice(0, 2).map((v, i) => ({
      label: v.angle || `Option ${i + 1}`,
      promptBase: v.imagePrompt || `${v.angle} local business social media`,
    }));
    if (!slice.length) {
      const clearId = requestAnimationFrame(() => {
        setAiImageTiles([]);
        setImageProviderNote("");
      });
      return () => cancelAnimationFrame(clearId);
    }

    let cancelled = false;

    (async () => {
      const cfgRes = await fetch("/api/images/config");
      const cfg = await cfgRes.json().catch(() => ({}));
      if (cancelled) return;

      if (!cfg.replicateConfigured) {
        setAiImageTiles(
          slice.map((s) => ({
            label: s.label,
            url: pollinationsImageUrl(s.promptBase),
          }))
        );
        setImageProviderNote("AI images use Pollinations (no Replicate key). Add REPLICATE_API_TOKEN to use Replicate.");
        return;
      }

      setImageProviderNote("AI images use Replicate (slower first load, then cached in your session).");
      setAiImageTiles(slice.map((s) => ({ label: s.label, url: null })));

      const settled = await Promise.allSettled(
        slice.map((s) =>
          fetch("/api/images/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: `${s.promptBase}. Angle focus: ${s.label}` }),
          }).then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || res.statusText);
            if (!data.url) throw new Error("No image URL");
            return { label: s.label, url: data.url };
          })
        )
      );

      if (cancelled) return;

      setAiImageTiles(
        settled.map((r, i) => {
          if (r.status === "fulfilled") return r.value;
          return {
            label: slice[i].label,
            url: pollinationsImageUrl(slice[i].promptBase),
          };
        })
      );
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- imageGenKey fingerprints the first two variation prompts
  }, [imageGenKey]);

  const pickAi = (idx) => {
    setUseUploadImage(false);
    setAiImageIndex(idx);
  };

  const pickUpload = () => {
    if (!uploadObjectUrl) return;
    setUseUploadImage(true);
    setAiImageIndex(null);
  };

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploadObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setUseUploadImage(true);
    setAiImageIndex(null);
  };

  const canCreate = Boolean(captionId) && (useUploadImage ? Boolean(uploadObjectUrl) : aiImageIndex !== null);
  const selectedCaption = variations.find((v) => v.id === captionId);

  if (!buzz || !variations.length) {
    return (
      <div className="flex min-h-[70vh] flex-col rounded-xl border border-[#E3E8EE] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#8898AA]">Preview</p>
        <p className="mt-4 text-base text-[#425466]">Ask Buzz for a post — a larger Instagram draft with AI images (or your upload) will show here.</p>
      </div>
    );
  }

  const imageSummary = useUploadImage ? "Your upload" : aiImageTiles[aiImageIndex ?? 0]?.label;

  return (
    <div className="max-h-[90vh] min-h-0 overflow-y-auto rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-semibold text-[#0A2540]">Instagram draft</p>
        <span className="rounded-full bg-[#F0EDFF] px-2 py-0.5 text-[11px] font-medium text-[#635BFF]">Powered by Gemini</span>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-[#425466]">
        Pick one AI image <span className="text-[#0A2540]">or</span> upload your own, then choose a caption. This block grows after Buzz responds so you can review everything in one place.
      </p>

      <section className="mb-10 rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] p-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#635BFF]">1 · Images</p>
        <p className="mb-4 text-sm text-[#425466]">
          {imageProviderNote || "Loading image settings…"} If a tile fails, use Upload yours.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {aiImageTiles.map((item, idx) => (
            <ImageCard
              key={`${idx}-${item.label}-${imageGenKey}-${item.url ?? "pending"}`}
              src={item.url}
              label={item.label}
              selected={!useUploadImage && aiImageIndex === idx}
              onSelect={() => pickAi(idx)}
            />
          ))}
        </div>
        <div className="mt-4 max-w-md">
          <UploadImageCard
            inputId="buzz-upload-image-input"
            selected={useUploadImage && Boolean(uploadObjectUrl)}
            previewUrl={uploadObjectUrl}
            onPickFile={onPickFile}
            onSelect={pickUpload}
          />
        </div>
      </section>

      <section className="mb-8">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8898AA]">2 · Captions</p>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
          {variations.slice(0, 3).map((v) => (
            <div
              key={v.id ?? v.angle}
              className={`min-w-[88%] shrink-0 snap-center rounded-2xl border-2 p-5 md:min-w-0 ${
                captionId === v.id ? "border-[#635BFF] bg-[#F0EDFF]/40 shadow-[0_0_0_3px_rgba(99,91,255,0.12)]" : "border-[#E3E8EE] bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-[#635BFF]">
                  <InstagramGlyph className="shrink-0" />
                  <span className="text-[13px] font-semibold uppercase tracking-wide text-[#635BFF]">Instagram · {v.angle}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCaptionId(v.id)}
                  className="rounded-lg bg-[#635BFF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4F46E5]"
                >
                  Use this
                </button>
              </div>
              <p className="mt-4 text-base leading-relaxed text-[#0A2540]">{v.caption}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(v.hashtags || []).map((tag) => (
                  <span key={tag} className="rounded-full bg-[#F0EDFF] px-3 py-1 text-xs font-medium text-[#635BFF]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        disabled={!canCreate}
        className={`mb-6 w-full rounded-lg py-3.5 text-base font-semibold ${
          canCreate ? "bg-[#635BFF] text-white hover:bg-[#4F46E5]" : "cursor-not-allowed bg-[#E3E8EE] text-[#8898AA]"
        }`}
      >
        {canCreate ? "Create post — ready" : "Select a caption and an image (AI or upload)"}
      </button>

      {canCreate && (
        <p className="mb-6 rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-4 text-sm text-[#425466]">
          <span className="font-semibold text-[#0A2540]">Summary:</span> {selectedCaption?.angle} caption + {imageSummary}.
        </p>
      )}

      <div className="space-y-2 border-t border-[#E3E8EE] pt-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8898AA]">Other channels</p>

        <button
          type="button"
          onClick={() => setAccordion((a) => ({ ...a, wa: !a.wa }))}
          className="flex w-full items-center justify-between rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-3 text-left text-sm font-medium text-[#0A2540]"
        >
          💬 WhatsApp
          <span className="text-[#8898AA]">{accordion.wa ? "−" : "+"}</span>
        </button>
        {accordion.wa && (
          <div className="rounded-xl border border-[#E3E8EE] bg-white p-4 text-sm text-[#425466]">{buzz.whatsapp?.message || "—"}</div>
        )}

        <button
          type="button"
          onClick={() => setAccordion((a) => ({ ...a, email: !a.email }))}
          className="flex w-full items-center justify-between rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-3 text-left text-sm font-medium text-[#0A2540]"
        >
          📧 Email · {emailCount} recipients
          <span className="text-[#8898AA]">{accordion.email ? "−" : "+"}</span>
        </button>
        {accordion.email && (
          <div className="space-y-2 rounded-xl border border-[#E3E8EE] bg-white p-4 text-sm">
            <p className="font-semibold text-[#0A2540]">{buzz.email?.subject}</p>
            <p className="whitespace-pre-wrap text-[#425466]">{buzz.email?.body}</p>
            {buzz.email?.ctaText && (
              <p className="text-xs text-[#635BFF]">
                CTA: <span className="font-semibold">{buzz.email.ctaText}</span>
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setAccordion((a) => ({ ...a, sms: !a.sms }))}
          className="flex w-full items-center justify-between rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-3 text-left text-sm font-medium text-[#0A2540]"
        >
          📱 SMS
          <span className="text-[#8898AA]">{accordion.sms ? "−" : "+"}</span>
        </button>
        {accordion.sms && <div className="rounded-xl border border-[#E3E8EE] bg-white p-4 text-sm text-[#425466]">{buzz.sms?.message || "—"}</div>}
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold text-amber-800">Buffer direct post</p>
        <p className="mt-1 text-xs text-amber-700">Coming soon — copy caption and image from above for now.</p>
      </div>
    </div>
  );
}
