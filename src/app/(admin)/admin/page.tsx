import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AdminAppointmentActions from "@/components/AdminAppointmentActions";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function formatDuration(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getDayRange(offset: number = 0): { start: string; end: string } {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset));
  const start = d.toISOString().split("T")[0]! + "T00:00:00.000Z";
  const end = d.toISOString().split("T")[0]! + "T23:59:59.999Z";
  return { start, end };
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayOfWeek = monday.getUTCDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setUTCDate(monday.getUTCDate() + diff);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    start: monday.toISOString().split("T")[0]! + "T00:00:00.000Z",
    end: sunday.toISOString().split("T")[0]! + "T23:59:59.999Z",
  };
}

function getGreeting(): string {
  const hour = new Date().getUTCHours() - 5; // CDT offset approx
  const h = ((hour % 24) + 24) % 24;
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-[#8a7e78]">Please sign in to view your dashboard.</p>
        <Link href="/login" className="text-[#9b6f6f] text-sm mt-2 block hover:underline">
          Sign in →
        </Link>
      </div>
    );
  }

  const { data: stylist } = await supabase
    .from("stylists").select("id, name, bio, avatar_url").eq("user_id", user.id).single();

  if (!stylist) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-[#f5ede8] flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-[#9b6f6f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl text-[#1a1714] mb-2">Welcome!</h1>
        <p className="text-[#8a7e78] text-sm mb-6">Let&apos;s set up your profile to start accepting bookings.</p>
        <Link
          href="/admin/profile"
          className="inline-flex items-center px-6 py-2.5 bg-[#9b6f6f] text-white text-sm font-medium rounded-full hover:bg-[#8a5f5f] transition-colors"
        >
          Create Profile
        </Link>
      </div>
    );
  }

  const today = getDayRange(0);
  const week = getWeekRange();

  const [
    { data: todayAppts },
    { count: weekCount },
    { count: pendingCount },
    { data: pendingAppts },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select(`*, client:profiles!client_id(id, full_name), service:services!service_id(id, name, duration_minutes, internal_price_cents)`)
      .eq("stylist_id", stylist.id)
      .eq("status", "confirmed")
      .gte("start_at", today.start)
      .lte("start_at", today.end)
      .order("start_at"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("stylist_id", stylist.id)
      .in("status", ["pending", "confirmed"])
      .gte("start_at", week.start)
      .lte("start_at", week.end),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("stylist_id", stylist.id)
      .eq("status", "pending")
      .gte("start_at", new Date().toISOString()),
    supabase
      .from("appointments")
      .select(`*, client:profiles!client_id(id, full_name), service:services!service_id(id, name, duration_minutes)`)
      .eq("stylist_id", stylist.id)
      .eq("status", "pending")
      .gte("start_at", new Date().toISOString())
      .order("start_at")
      .limit(10),
  ]);

  const todayList = todayAppts ?? [];
  const pendingList = pendingAppts ?? [];

  const now = new Date();
  const todayDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  });

  const greeting = getGreeting();

  return (
    <div className="max-w-lg mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-xs text-[#c9a96e] uppercase tracking-widest font-medium mb-1">{todayDate}</p>
        <h1 className="font-display text-3xl text-[#1a1714]">
          {greeting}, Keri
        </h1>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-[#e8e2dc] p-4 text-center">
          <p className="text-2xl font-bold text-[#9b6f6f]">{todayList.length}</p>
          <p className="text-[10px] text-[#8a7e78] mt-0.5 uppercase tracking-wide">Today</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e8e2dc] p-4 text-center">
          <p className="text-2xl font-bold text-[#c9a96e]">{weekCount ?? 0}</p>
          <p className="text-[10px] text-[#8a7e78] mt-0.5 uppercase tracking-wide">This Week</p>
        </div>
        <div className={`rounded-2xl border p-4 text-center ${(pendingCount ?? 0) > 0 ? "bg-[#fffbeb] border-[#fcd34d]" : "bg-white border-[#e8e2dc]"}`}>
          <p className={`text-2xl font-bold ${(pendingCount ?? 0) > 0 ? "text-[#d97706]" : "text-[#8a7e78]"}`}>{pendingCount ?? 0}</p>
          <p className="text-[10px] text-[#8a7e78] mt-0.5 uppercase tracking-wide">Pending</p>
        </div>
      </div>

      {/* PENDING REQUESTS — big and prominent */}
      <div className={`rounded-2xl border mb-6 overflow-hidden ${(pendingCount ?? 0) > 0 ? "border-[#fcd34d] bg-[#fffbeb]" : "border-[#e8e2dc] bg-white"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3e8c8]">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${(pendingCount ?? 0) > 0 ? "bg-[#d97706] text-white" : "bg-[#e8e2dc] text-[#8a7e78]"}`}>
              {(pendingCount ?? 0) > 0 ? (
                <span className="flex items-center gap-0.5">
                  {pendingCount}
                  {(pendingCount ?? 0) > 0 && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />}
                </span>
              ) : "0"}
            </div>
            <div>
              <h2 className="font-display text-lg text-[#1a1714] leading-none">Pending Requests</h2>
              {(pendingCount ?? 0) > 0 && (
                <p className="text-xs text-[#d97706] mt-0.5">Clients waiting for confirmation</p>
              )}
            </div>
          </div>
          {(pendingCount ?? 0) > 0 && (
            <Link href="/admin/appointments" className="text-xs text-[#d97706] font-semibold">
              View all →
            </Link>
          )}
        </div>

        {pendingList.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[#8a7e78]">No pending requests right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#fef3c7]">
            {pendingList.map((appt) => {
              const service = appt.service as { id: string; name: string; duration_minutes: number } | null;
              const client = appt.client as { id: string; full_name: string | null } | null;
              const apptDate = new Date(appt.start_at);

              return (
                <div key={appt.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#1a1714] text-sm truncate">
                        {client?.full_name ?? "Guest"}
                      </p>
                      <p className="text-xs text-[#8a7e78] mt-0.5">{service?.name}</p>
                      <p className="text-xs text-[#c9a96e] mt-0.5">
                        {apptDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })}
                        {" · "}
                        {formatTime(appt.start_at)}
                        {service && ` · ${formatDuration(service.duration_minutes)}`}
                      </p>
                    </div>
                  </div>
                  <AdminAppointmentActions appointmentId={appt.id} inline />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TODAY'S SCHEDULE */}
      <div className="bg-white rounded-2xl border border-[#e8e2dc] overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e2dc]">
          <h2 className="font-display text-lg text-[#1a1714]">Today&apos;s Schedule</h2>
          <Link href="/admin/appointments" className="text-xs text-[#9b6f6f] font-medium">
            View all →
          </Link>
        </div>

        {todayList.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-[#f5ede8] flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <p className="text-sm text-[#1a1714] font-medium">No confirmed appointments today</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f5f0eb]">
            {todayList.map((appt) => {
              const service = appt.service as { id: string; name: string; duration_minutes: number } | null;
              const client = appt.client as { id: string; full_name: string | null } | null;

              return (
                <div key={appt.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-shrink-0 w-14 text-center">
                    <p className="text-sm font-semibold text-[#1a1714]">{formatTime(appt.start_at)}</p>
                    <p className="text-[10px] text-[#8a7e78]">{service ? formatDuration(service.duration_minutes) : ""}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center self-stretch py-1">
                    <div className="w-2 h-2 rounded-full bg-[#9b6f6f] flex-shrink-0 mt-0.5" />
                    <div className="w-px flex-1 bg-[#e8e2dc] mt-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a1714] truncate">
                      {client?.full_name ?? "Guest"}
                    </p>
                    <p className="text-xs text-[#8a7e78] mt-0.5 truncate">{service?.name}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 flex-shrink-0">
                    Confirmed
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
