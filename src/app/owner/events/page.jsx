"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/owner/Sidebar";
import EventCard from "@/components/owner/EventCard";
import { demoBusiness, events as demoEvents, wellnessDemoEvents } from "@/lib/demoData";
import { getOwnerSession, getOwnerUsers } from "@/lib/localAuth";

function isWellnessBusiness(business) {
  const s = `${business?.business_type || ""} ${business?.business_name || ""}`.toLowerCase();
  return /wellness|health|yoga|spa|mindful|holistic|pilates|meditation/.test(s);
}

export default function EventsPage() {
  const [eventList, setEventList] = useState(demoEvents);
  const [source, setSource] = useState("demo");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const session = getOwnerSession();
      const user = session?.email ? getOwnerUsers().find((u) => u.email === session.email) : null;
      const business = user
        ? {
            ...demoBusiness,
            business_name: user.business_name || demoBusiness.business_name,
            business_type: user.business_type || demoBusiness.business_type,
            location: user.location || demoBusiness.location,
            neighborhood: user.neighborhood || demoBusiness.neighborhood,
            phone: user.phone || demoBusiness.phone,
            language: user.language || demoBusiness.language,
          }
        : demoBusiness;

      const wellness = isWellnessBusiness(business);
      if (wellness) {
        setEventList(wellnessDemoEvents);
        setSource("demo");
      }

      try {
        const res = await fetch("/api/events/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business }),
        });
        const data = await res.json();
        if (cancelled || !Array.isArray(data.events)) return;
        if (data.events.length > 0) {
          if (wellness) {
            setEventList([...wellnessDemoEvents, ...data.events].slice(0, 12));
          } else {
            setEventList(data.events);
          }
          setSource("live");
        } else if (!wellness) {
          setEventList(demoEvents);
          setSource("demo");
        }
      } catch {
        if (!cancelled && !wellness) {
          setEventList(demoEvents);
          setSource("demo");
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <main>
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[#E3E8EE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <span className="rounded-full bg-[#F6F9FC] px-3 py-1 text-xs text-[#425466]">This week</span>
          <span className="rounded-full bg-[#F6F9FC] px-3 py-1 text-xs text-[#425466]">Within 10mi</span>
          <span className="rounded-full bg-[#F6F9FC] px-3 py-1 text-xs text-[#425466]">Any attendance</span>
          <p className="ml-auto max-w-md text-right text-xs leading-snug text-[#8898AA]">
            {source === "live" ? (
              <>
                <span className="font-medium text-[#425466]">Live results:</span> Eventbrite + Luma when{" "}
                <code className="rounded bg-[#F6F9FC] px-1">EVENTBRITE_API_KEY</code> / Luma access work; events are scored for your business type.
              </>
            ) : (
              <>
                <span className="font-medium text-[#425466]">Demo calendar</span> — curated wellness picks for Health &amp; Wellness accounts. Add{" "}
                <code className="rounded bg-[#F6F9FC] px-1">EVENTBRITE_API_KEY</code> in <code className="rounded bg-[#F6F9FC] px-1">.env.local</code> so{" "}
                <code className="rounded bg-[#F6F9FC] px-1">findMatchingEvents</code> can pull real Eventbrite search results (see <code className="rounded bg-[#F6F9FC] px-1">eventAgent.js</code>
                ).
              </>
            )}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {eventList.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </main>
    </div>
  );
}
