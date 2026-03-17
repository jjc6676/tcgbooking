"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

interface PublicService {
  id: string;
  name: string;
  duration_minutes: number;
  notes?: string | null;
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

function DeletedBanner() {
  const searchParams = useSearchParams();
  const deleted = searchParams.get("deleted");
  if (!deleted) return null;
  return (
    <div className="mb-6 bg-[#1a1714] text-white rounded-2xl px-5 py-4 flex items-start gap-3">
      <svg className="w-5 h-5 text-[#c9a96e] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
      </svg>
      <div>
        <p className="font-semibold text-sm mb-0.5">Account deleted</p>
        <p className="text-xs text-[#a89e96]">
          Your account has been permanently deleted. You can still browse and book as a guest.
        </p>
      </div>
    </div>
  );
}

function BookContent() {
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
      <div className="max-w-xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-10 animate-pulse">
          <div className="w-20 h-20 rounded-full bg-[#f0ebe6] mx-auto mb-5" />
          <div className="h-8 bg-[#f0ebe6] rounded w-48 mx-auto mb-3" />
          <div className="h-4 bg-[#f0ebe6] rounded w-64 mx-auto" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#e8e2dc] rounded-2xl px-5 py-4 animate-pulse">
              <div className="h-4 bg-[#f0ebe6] rounded w-40 mb-2" />
              <div className="h-3 bg-[#f0ebe6] rounded w-20" />
            </div>
          ))}
        </div>
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

  // Single stylist flow
  if (stylists.length === 1 && stylists[0]) {
    const stylist = stylists[0];

    return (
      <div className="max-w-xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f5ede8] to-[#e8d8d0] flex items-center justify-center mx-auto mb-5 border-2 border-[#e8e2dc] shadow-sm overflow-hidden">
            {stylist.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={stylist.avatar_url} alt={stylist.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-4xl text-[#9b6f6f]">K</span>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#1a1714] mb-1">Keri Choplin</h1>
          <p className="text-[#8a7e78] text-sm sm:text-base font-light">Luxury hair · Lafayette, Louisiana</p>
          {stylist.bio && (
            <p className="text-[#8a7e78] text-sm mt-3 max-w-sm mx-auto leading-relaxed">{stylist.bio}</p>
          )}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-10 bg-[#c9a96e]" />
            <span className="text-[#c9a96e] text-[10px] tracking-[0.25em] uppercase font-medium">Select a Service</span>
            <div className="h-px w-10 bg-[#c9a96e]" />
          </div>
        </div>

        {/* Service list */}
        <div className="space-y-2">
          {stylist.services.map((svc) => (
            <Link
              key={svc.id}
              href={`/book/${stylist.id}?serviceId=${svc.id}`}
              className="group flex items-center justify-between bg-white rounded-2xl border border-[#e8e2dc] px-5 py-4 hover:border-[#9b6f6f] hover:shadow-sm active:scale-[0.99] transition-all min-h-[64px]"
            >
              <div className="min-w-0 pr-3">
                <p className="font-medium text-[#1a1714] text-sm group-hover:text-[#9b6f6f] transition-colors">
                  {svc.name}
                </p>
                <p className="text-xs text-[#8a7e78] mt-0.5">
                  {formatDuration(svc.duration_minutes)}
                </p>
                {svc.notes && (
                  <p className="text-xs text-[#c9a96e] mt-0.5 italic">{svc.notes}</p>
                )}
              </div>
              <svg
                className="w-4 h-4 text-[#c9a96e] flex-shrink-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <p className="text-xs text-[#8a7e78] text-center mt-6">
          Need to reschedule? &nbsp;
          <a href="mailto:kerichoplin@gmail.com" className="text-[#9b6f6f] hover:underline">
            Contact Keri
          </a>
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
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f5ede8] to-[#e8d8d0] flex items-center justify-center border-2 border-[#e8e2dc] overflow-hidden">
              {stylist.avatar_url
                ? <img src={stylist.avatar_url} alt={stylist.name} className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                : <span className="font-display text-2xl text-[#9b6f6f]">{stylist.name.charAt(0)}</span>
              }
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
                className="group flex items-center justify-between bg-white rounded-2xl border border-[#e8e2dc] px-5 py-4 hover:border-[#9b6f6f] hover:shadow-sm active:scale-[0.99] transition-all min-h-[64px]"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-medium text-[#1a1714] text-sm group-hover:text-[#9b6f6f] transition-colors">
                    {svc.name}
                  </p>
                  <p className="text-xs text-[#8a7e78] mt-0.5">{formatDuration(svc.duration_minutes)}</p>
                </div>
                <svg className="w-4 h-4 text-[#c9a96e] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

export default function BookPage() {
  return (
    <div>
      <Suspense fallback={null}>
        <DeletedBanner />
      </Suspense>
      <Suspense fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-[#9b6f6f] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <BookContent />
      </Suspense>
    </div>
  );
}
