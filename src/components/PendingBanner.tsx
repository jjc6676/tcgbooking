"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PendingBanner() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data: stylist } = await supabase
          .from("stylists")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (!stylist || cancelled) return;

        const { count: c } = await supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("stylist_id", stylist.id)
          .in("status", ["pending", "reschedule_requested"])
          .gte("start_at", new Date().toISOString());

        if (!cancelled) setCount(c ?? 0);
      } catch {
        // silently fail
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/admin/appointments"
      className="sticky top-[53px] lg:top-0 z-30 flex items-center justify-center gap-2 bg-amber-100 border-b border-amber-200 px-4 py-2.5 text-amber-800 text-sm font-semibold hover:bg-amber-200 transition-colors"
    >
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      You have {count} pending request{count === 1 ? "" : "s"} — tap to review
    </Link>
  );
}
