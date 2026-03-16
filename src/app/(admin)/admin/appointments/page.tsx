"use client";

import { useEffect, useState } from "react";
import type { AppointmentStatus } from "@/lib/supabase/types";

interface AppointmentRow {
  id: string;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  created_at: string;
  client: { id: string; full_name: string | null } | null;
  service: { id: string; name: string; duration_minutes: number } | null;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "all" | "cancelled">("upcoming");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function loadAppointments() {
    setLoading(true);
    let url = "/api/admin/appointments";
    if (filter === "cancelled") url += "?status=cancelled";
    else if (filter === "all") url += "?status=all";
    const res = await fetch(url);
    const data = await res.json();
    setAppointments(data.appointments ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    setUpdating(id);
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: data.appointment.status } : a))
      );
    }
    setUpdating(null);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Appointments</h1>
      <p className="text-sm text-gray-500 mb-6">
        View and manage your client bookings.
      </p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["upcoming", "all", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : appointments.length === 0 ? (
        <p className="text-sm text-gray-400">No appointments found.</p>
      ) : (
        <div className="bg-white border rounded-lg divide-y">
          {appointments.map((appt) => (
            <div key={appt.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[appt.status]}`}
                    >
                      {STATUS_LABELS[appt.status]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {appt.client?.full_name ?? "Unknown client"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {appt.service?.name ?? "Unknown service"} · {formatDateTime(appt.start_at)}
                  </p>
                </div>

                {appt.status !== "cancelled" && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {appt.status === "pending" && (
                      <button
                        onClick={() => updateStatus(appt.id, "confirmed")}
                        disabled={updating === appt.id}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(appt.id, "cancelled")}
                      disabled={updating === appt.id}
                      className="text-xs border border-red-300 text-red-600 px-3 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
