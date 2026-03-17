"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

interface PendingAppt {
  id: string;
  start_at: string;
  client: { id: string; full_name: string | null } | null;
  service: { id: string; name: string; duration_minutes: number } | null;
}

interface Props {
  initialAppts: PendingAppt[];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

function formatDuration(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function PendingRequestsList({ initialAppts }: Props) {
  const [appts, setAppts] = useState<PendingAppt[]>(initialAppts);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { toast } = useToast();

  const act = useCallback(
    async (id: string, status: "confirmed" | "cancelled") => {
      // Optimistic: remove instantly
      setAppts((prev) => prev.filter((a) => a.id !== id));
      setErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });

      const label = status === "confirmed" ? "Confirmed ✓" : "Declined";
      toast(label, status === "confirmed" ? "success" : "info");

      try {
        const res = await fetch(`/api/admin/appointments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed");
        router.refresh();
      } catch {
        // Revert
        setAppts((prev) => {
          const original = initialAppts.find((a) => a.id === id);
          if (!original || prev.find((a) => a.id === id)) return prev;
          const idx = initialAppts.findIndex((a) => a.id === id);
          const next = [...prev];
          next.splice(Math.max(0, idx), 0, original);
          return next;
        });
        setErrors((prev) => ({ ...prev, [id]: "Failed — tap to retry." }));
        toast("Action failed. Please try again.", "error");
      }
    },
    [initialAppts, router, toast]
  );

  if (appts.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-[#8a7e78]">No pending requests right now.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#fef3c7]">
      {appts.map((appt) => {
        const apptDate = new Date(appt.start_at);
        const errMsg = errors[appt.id];

        return (
          <div key={appt.id} className="px-5 py-4">
            <div className="mb-3">
              <p className="font-semibold text-[#1a1714] text-sm">{appt.client?.full_name ?? "Guest"}</p>
              <p className="text-xs text-[#8a7e78] mt-0.5">{appt.service?.name}</p>
              <p className="text-xs text-[#c9a96e] mt-0.5">
                {apptDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })}
                {" · "}{formatTime(appt.start_at)}
                {appt.service && ` · ${formatDuration(appt.service.duration_minutes)}`}
              </p>
            </div>

            {errMsg ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">{errMsg}</span>
                <button onClick={() => setErrors((p) => { const n = { ...p }; delete n[appt.id]; return n; })} className="text-xs text-[#8a7e78] underline">Dismiss</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => act(appt.id, "confirmed")}
                  className="flex items-center gap-1 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-full hover:bg-emerald-700 active:scale-95 transition-all min-h-[44px]"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm
                </button>
                <button
                  onClick={() => act(appt.id, "cancelled")}
                  className="flex items-center gap-1 px-4 py-2.5 border border-red-200 text-red-600 text-xs font-semibold rounded-full hover:bg-red-50 active:scale-95 transition-all min-h-[44px]"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Decline
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
