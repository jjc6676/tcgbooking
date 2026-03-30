"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

interface MergePreview {
  appointmentCount: number;
  serviceLogCount: number;
  waitlistCount: number;
  willTransferPhone: boolean;
  willTransferNotes: boolean;
  walkIn: { id: string; full_name: string; phone?: string | null; email?: string | null; notes?: string | null } | null;
  authClient: { id: string; full_name: string | null; phone?: string | null } | null;
}

interface Props {
  /** The pending_merges row id (for auto-detected suggestions) */
  suggestionId?: string;
  /** For admin-manual merges: provide these directly */
  walkInClientId?: string;
  authClientId?: string;
  onClose: () => void;
  onMerged: () => void;
}

export default function MergeReviewDialog({ suggestionId, walkInClientId, authClientId, onClose, onMerged }: Props) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<MergePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);
  const [resolvedSuggestionId, setResolvedSuggestionId] = useState<string | null>(suggestionId ?? null);

  useEffect(() => {
    async function loadPreview() {
      setLoading(true);
      try {
        // For manual merges without a suggestion id, create one first
        let sid = resolvedSuggestionId;
        if (!sid && walkInClientId && authClientId) {
          const res = await fetch("/api/admin/merge-suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walk_in_client_id: walkInClientId, auth_client_id: authClientId }),
          });
          if (!res.ok) {
            const d = await res.json();
            toast(d.error ?? "Failed to prepare merge", "error");
            onClose();
            return;
          }
          const { suggestion } = await res.json();
          sid = suggestion.id as string;
          setResolvedSuggestionId(sid);
        }
        if (!sid) return;

        const res = await fetch(`/api/admin/merge-suggestions/${sid}`);
        if (!res.ok) {
          toast("Failed to load merge preview", "error");
          onClose();
          return;
        }
        const { preview: p } = await res.json();
        setPreview(p);
      } catch {
        toast("Failed to load merge preview", "error");
        onClose();
      } finally {
        setLoading(false);
      }
    }
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAction(action: "merge" | "dismiss") {
    if (!resolvedSuggestionId) return;
    setMerging(true);
    try {
      const res = await fetch(`/api/admin/merge-suggestions/${resolvedSuggestionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast(d.error ?? "Action failed", "error");
        return;
      }
      if (action === "merge") {
        toast(`${preview?.walkIn?.full_name ?? "Client"} merged successfully`, "success");
        onMerged();
      } else {
        toast("Dismissed", "info");
        onClose();
      }
    } catch {
      toast("Action failed", "error");
    } finally {
      setMerging(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={() => !merging && onClose()} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl p-5 max-w-2xl mx-auto lg:inset-x-auto lg:w-[600px] lg:left-1/2 lg:-translate-x-1/2"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        <div className="w-10 h-1 bg-[#e8e2dc] rounded-full mx-auto mb-4" />
        <h3 className="font-display text-lg text-[#1a1714] mb-1">Merge Clients</h3>
        <p className="text-xs text-[#8a7e78] mb-5">
          All history from the walk-in record will move to the registered account.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#9b6f6f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : preview ? (
          <>
            {/* Client cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#faf9f7] rounded-xl border border-[#e8e2dc] p-3">
                <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-wide mb-1">Walk-in</p>
                <p className="text-sm font-semibold text-[#1a1714] truncate">{preview.walkIn?.full_name ?? "—"}</p>
                {preview.walkIn?.email && <p className="text-xs text-[#8a7e78] truncate mt-0.5">{preview.walkIn.email}</p>}
                {preview.walkIn?.phone && <p className="text-xs text-[#8a7e78] mt-0.5">{preview.walkIn.phone}</p>}
              </div>
              <div className="bg-[#f0f7f0] rounded-xl border border-[#d4e8d4] p-3">
                <p className="text-[10px] font-semibold text-[#5a8a5a] uppercase tracking-wide mb-1">Registered</p>
                <p className="text-sm font-semibold text-[#1a1714] truncate">{preview.authClient?.full_name ?? "—"}</p>
                {preview.authClient?.phone && <p className="text-xs text-[#8a7e78] mt-0.5">{preview.authClient.phone}</p>}
              </div>
            </div>

            {/* What transfers */}
            <div className="bg-[#faf9f7] rounded-xl border border-[#e8e2dc] p-4 mb-5 space-y-2">
              <p className="text-xs font-semibold text-[#5c4a42] mb-2">What will transfer</p>
              <TransferRow label="Appointments" count={preview.appointmentCount} />
              <TransferRow label="Service log entries" count={preview.serviceLogCount} />
              {preview.waitlistCount > 0 && <TransferRow label="Waitlist entries" count={preview.waitlistCount} />}
              {preview.willTransferPhone && (
                <div className="flex items-center gap-2 text-xs text-[#5c4a42]">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Phone number will be copied to registered account</span>
                </div>
              )}
              {preview.willTransferNotes && (
                <div className="flex items-center gap-2 text-xs text-[#5c4a42]">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Walk-in notes will be appended to client notes</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAction("merge")}
                disabled={merging}
                className="flex-1 py-2.5 bg-[#9b6f6f] text-white text-sm font-semibold rounded-full hover:bg-[#8a5f5f] disabled:opacity-50 transition-all active:scale-95 min-h-[44px]"
              >
                {merging ? "Merging…" : "Merge accounts"}
              </button>
              <button
                onClick={() => handleAction("dismiss")}
                disabled={merging}
                className="px-5 py-2.5 border border-[#e8e2dc] text-sm text-[#8a7e78] font-medium rounded-full hover:bg-[#f5f0eb] disabled:opacity-50 transition-all active:scale-95 min-h-[44px]"
              >
                Not a match
              </button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

function TransferRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[#5c4a42]">{label}</span>
      <span className={`font-semibold ${count > 0 ? "text-[#1a1714]" : "text-[#a09890]"}`}>
        {count > 0 ? count : "none"}
      </span>
    </div>
  );
}
