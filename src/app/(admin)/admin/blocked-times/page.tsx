"use client";

import { useEffect, useState } from "react";
import type { BlockedTime } from "@/lib/supabase/types";

function formatDisplayDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BlockedTimesPage() {
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Default start = tomorrow at 09:00, end = tomorrow at 17:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().slice(0, 10);

  const [startAt, setStartAt] = useState(`${defaultDate}T09:00`);
  const [endAt, setEndAt] = useState(`${defaultDate}T17:00`);
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadBlockedTimes();
  }, []);

  async function loadBlockedTimes() {
    setLoading(true);
    const res = await fetch("/api/admin/blocked-times");
    const data = await res.json();
    setBlockedTimes(data.blocked_times ?? []);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/blocked-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          reason: reason.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save" });
      } else {
        setBlockedTimes((prev) => [...prev, data.blocked_time].sort(
          (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
        ));
        setReason("");
        setMessage({ type: "success", text: "Block added." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this blocked time?")) return;
    const res = await fetch(`/api/admin/blocked-times/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBlockedTimes((prev) => prev.filter((b) => b.id !== id));
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-1">Blocked Times</h1>
      <p className="text-sm text-gray-500 mb-6">
        Block off windows when you&apos;re unavailable — vacations, personal time, etc.
      </p>

      {/* Upcoming blocks */}
      {blockedTimes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Upcoming Blocks
          </h2>
          <div className="bg-white border rounded-lg divide-y">
            {blockedTimes.map((b) => (
              <div key={b.id} className="flex items-start justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {formatDisplayDate(b.start_at)} – {formatDisplayDate(b.end_at)}
                  </p>
                  {b.reason && (
                    <p className="text-xs text-gray-400 mt-0.5">{b.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-xs text-red-500 hover:text-red-700 ml-4 flex-shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {blockedTimes.length === 0 && (
        <p className="text-sm text-gray-400 mb-8">No upcoming blocks.</p>
      )}

      {/* Add block form */}
      <form onSubmit={handleAdd} className="bg-white border rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Add Block</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              required
              className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Reason <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Vacation, Personal day"
            className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Adding…" : "Add Block"}
        </button>
      </form>
    </div>
  );
}
