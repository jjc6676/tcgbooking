"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AppointmentWithDetails {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  client_notes?: string | null;
  stylist: { id: string; name: string } | null;
  service: { id: string; name: string; duration_minutes: number } | null;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: "Awaiting Approval", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  confirmed: { label: "Confirmed", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-300" },
};

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#e8e2dc] p-5 flex items-start gap-4 animate-pulse">
          <div className="w-14 h-14 rounded-xl bg-[#f0ebe6] flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-[#f0ebe6] rounded w-32 mb-2" />
            <div className="h-3 bg-[#f0ebe6] rounded w-24 mb-3" />
            <div className="h-6 bg-[#f0ebe6] rounded-full w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setAppointments(data.appointments ?? []);
      })
      .catch(() => setError("Failed to load appointments"))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date().toISOString();
  const upcoming = appointments.filter((a) => a.status !== "cancelled" && a.start_at >= now);
  const past = appointments.filter((a) => a.status === "confirmed" && a.start_at < now);
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-[#1a1714]">My Appointments</h1>
          <p className="text-[#8a7e78] text-sm mt-1">Your bookings with Keri</p>
        </div>
        <Link href="/book" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#9b6f6f] text-white text-sm font-medium rounded-full hover:bg-[#8a5f5f] transition-colors min-h-[44px]">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Book
        </Link>
      </div>

      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e8e2dc]">
          <p className="text-[#8a7e78] mb-3">Unable to load appointments.</p>
          <Link href="/login" className="text-[#9b6f6f] text-sm hover:underline">Sign in to view your appointments →</Link>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e8e2dc]">
          <div className="w-14 h-14 rounded-full bg-[#f5ede8] flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#9b6f6f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-display text-xl text-[#1a1714] mb-2">No appointments yet</p>
          <p className="text-sm text-[#8a7e78] mb-6">Ready to book your first appointment with Keri?</p>
          <Link href="/book" className="inline-flex items-center px-6 py-2.5 bg-[#9b6f6f] text-white text-sm font-medium rounded-full hover:bg-[#8a5f5f] transition-colors">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-[#c9a96e] uppercase tracking-widest mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((appt) => {
                  const status = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG["pending"]!;
                  const isPending = appt.status === "pending";
                  return (
                    <div key={appt.id} className={`bg-white rounded-2xl border p-5 flex items-start gap-4 ${isPending ? "border-amber-200" : "border-[#e8e2dc]"}`}>
                      {/* Date badge */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#f5ede8] flex flex-col items-center justify-center">
                        <span className="text-[10px] font-semibold text-[#c9a96e] uppercase leading-none">
                          {new Date(appt.start_at).toLocaleDateString([], { weekday: "short", timeZone: "UTC" })}
                        </span>
                        <span className="text-lg font-bold text-[#9b6f6f] leading-none mt-0.5">
                          {new Date(appt.start_at).toLocaleDateString([], { day: "numeric", timeZone: "UTC" })}
                        </span>
                        <span className="text-[9px] text-[#8a7e78] uppercase leading-none mt-0.5">
                          {new Date(appt.start_at).toLocaleDateString([], { month: "short", timeZone: "UTC" })}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-[#1a1714] text-sm leading-tight">{appt.service?.name ?? "Service"}</p>
                            <p className="text-xs text-[#8a7e78] mt-0.5">with {appt.stylist?.name ?? "Keri"}</p>
                          </div>
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${status.bg} ${status.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${isPending ? "animate-pulse" : ""}`} />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-[#8a7e78] flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                            </svg>
                            {formatTime(appt.start_at)}
                          </span>
                          <span className="text-[#e8e2dc]">·</span>
                          <span className="text-xs text-[#8a7e78]">{formatDuration(appt.service?.duration_minutes ?? 0)}</span>
                        </div>
                        {appt.client_notes && (
                          <p className="text-xs text-[#8a7e78] mt-2 italic">
                            &ldquo;{appt.client_notes}&rdquo;
                          </p>
                        )}
                        <div className="mt-3">
                          <a
                            href="mailto:kerichoplin@gmail.com"
                            className="text-xs text-[#9b6f6f] hover:underline"
                          >
                            Questions? Contact Keri →
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-[#8a7e78] uppercase tracking-widest mb-3">Past</h2>
              <div className="space-y-2 opacity-60">
                {past.map((appt) => (
                  <div key={appt.id} className="bg-white rounded-xl border border-[#e8e2dc] px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1a1714]">{appt.service?.name}</p>
                      <p className="text-xs text-[#8a7e78]">{formatDateTime(appt.start_at)}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Completed</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cancelled.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-[#8a7e78] uppercase tracking-widest mb-3">Cancelled</h2>
              <div className="space-y-2 opacity-50">
                {cancelled.map((appt) => (
                  <div key={appt.id} className="bg-white rounded-xl border border-[#e8e2dc] px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1a1714] line-through">{appt.service?.name}</p>
                      <p className="text-xs text-[#8a7e78]">{formatDateTime(appt.start_at)}</p>
                    </div>
                    <span className="text-xs text-gray-400">Cancelled</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
