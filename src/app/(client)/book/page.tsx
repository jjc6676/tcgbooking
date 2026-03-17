"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PublicService {
  id: string;
  name: string;
  duration_minutes: number;
}

interface PublicStylist {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  services: PublicService[];
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function BookPage() {
  const [stylists, setStylists] = useState<PublicStylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stylists")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStylists(data.stylists ?? []);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#9b6f6f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-[#8a7e78]">
        <p>Unable to load at this time. Please try again.</p>
      </div>
    );
  }

  if (stylists.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-2xl text-[#1a1714] mb-2">Coming Soon</p>
        <p className="text-[#8a7e78]">Booking will be available shortly. Check back soon.</p>
      </div>
    );
  }

  // Redirect to the single stylist booking page
  if (stylists.length === 1 && stylists[0]) {
    const stylist = stylists[0];

    return (
      <div className="max-w-xl mx-auto">
        {/* Hero header */}
        <div className="text-center mb-10">
          {/* Monogram */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f5ede8] to-[#e8d8d0] flex items-center justify-center mx-auto mb-5 border-2 border-[#e8e2dc] shadow-sm">
            <span className="font-display text-4xl text-[#9b6f6f]">K</span>
          </div>
          <h1 className="font-display text-4xl text-[#1a1714] mb-2">Keri Choplin</h1>
          <p className="text-[#8a7e78] text-base font-light">Luxury hair services in Lafayette, Louisiana</p>
          {stylist.bio && (
            <p className="text-[#8a7e78] text-sm mt-3 max-w-sm mx-auto leading-relaxed">{stylist.bio}</p>
          )}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-10 bg-[#c9a96e]" />
            <span className="text-[#c9a96e] text-[10px] tracking-[0.25em] uppercase">Select a Service</span>
            <div className="h-px w-10 bg-[#c9a96e]" />
          </div>
        </div>

        {/* Flat service list */}
        <div className="space-y-2">
          {stylist.services.map((svc) => (
            <Link
              key={svc.id}
              href={`/book/${stylist.id}?serviceId=${svc.id}`}
              className="group flex items-center justify-between bg-white rounded-2xl border border-[#e8e2dc] px-5 py-4 hover:border-[#9b6f6f] hover:shadow-sm transition-all"
            >
              <div>
                <p className="font-medium text-[#1a1714] text-sm group-hover:text-[#9b6f6f] transition-colors">
                  {svc.name}
                </p>
                <p className="text-xs text-[#8a7e78] mt-0.5">{formatDuration(svc.duration_minutes)}</p>
              </div>
              <svg
                className="w-4 h-4 text-[#c9a96e] flex-shrink-0 ml-3"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <p className="text-xs text-[#8a7e78] text-center mt-6">
          Need to cancel? Contact Keri directly.
        </p>
      </div>
    );
  }

  // Multiple stylists fallback
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl text-[#1a1714] mb-2">Book an Appointment</h1>
        <p className="text-[#8a7e78]">Select a service to get started.</p>
      </div>
      {stylists.map((stylist) => (
        <div key={stylist.id} className="mb-10">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f5ede8] to-[#e8d8d0] flex items-center justify-center border-2 border-[#e8e2dc]">
              <span className="font-display text-2xl text-[#9b6f6f]">{stylist.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="font-display text-2xl text-[#1a1714]">{stylist.name}</h2>
              {stylist.bio && <p className="text-xs text-[#8a7e78] mt-0.5">{stylist.bio}</p>}
            </div>
          </div>
          <div className="space-y-2">
            {stylist.services.map((svc) => (
              <Link
                key={svc.id}
                href={`/book/${stylist.id}?serviceId=${svc.id}`}
                className="group flex items-center justify-between bg-white rounded-2xl border border-[#e8e2dc] px-5 py-4 hover:border-[#9b6f6f] hover:shadow-sm transition-all"
              >
                <div>
                  <p className="font-medium text-[#1a1714] text-sm group-hover:text-[#9b6f6f] transition-colors">
                    {svc.name}
                  </p>
                  <p className="text-xs text-[#8a7e78] mt-0.5">{formatDuration(svc.duration_minutes)}</p>
                </div>
                <svg className="w-4 h-4 text-[#c9a96e] flex-shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
