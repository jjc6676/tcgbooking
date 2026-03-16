"use client";

import { useEffect, useState } from "react";
import type { OperationalHour } from "@/lib/supabase/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function HoursPage() {
  const [hours, setHours] = useState<OperationalHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [day, setDay] = useState(1);
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("17:00");

  useEffect(() => {
    loadHours();
  }, []);

  async function loadHours() {
    setLoading(true);
    const res = await fetch("/api/admin/hours");
    const data = await res.json();
    setHours(data.hours ?? []);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day_of_week: day, open_time: openTime, close_time: closeTime }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save" });
      } else {
        setMessage({ type: "success", text: `${DAYS[day]} hours saved.` });
        await loadHours();
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, dayIndex: number) {
    if (!confirm(`Remove hours for ${DAYS[dayIndex]}?`)) return;
    await fetch(`/api/admin/hours/${id}`, { method: "DELETE" });
    setHours((prev) => prev.filter((h) => h.id !== id));
  }

  const configuredDays = new Set(hours.map((h) => h.day_of_week));

  if (loading) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-1">Operational Hours</h1>
      <p className="text-sm text-gray-500 mb-6">
        Set the days and times you accept bookings. One entry per day.
      </p>

      {/* Current hours */}
      {hours.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Current Schedule
          </h2>
          <div className="bg-white border rounded-lg divide-y">
            {hours.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="font-medium text-sm">{DAYS[h.day_of_week]}</span>
                  <span className="ml-3 text-sm text-gray-500">
                    {h.open_time.slice(0, 5)} – {h.close_time.slice(0, 5)}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(h.id, h.day_of_week)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / update hours */}
      <form onSubmit={handleAdd} className="bg-white border rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">
          {configuredDays.size === 7 ? "Update a Day" : "Add Hours"}
        </h2>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAYS.map((name, i) => (
                <option key={i} value={i}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Open</label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              required
              className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Close</label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              required
              className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : configuredDays.has(day) ? "Update Hours" : "Add Hours"}
        </button>
      </form>
    </div>
  );
}
