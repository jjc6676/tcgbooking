"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSignOutButton() {
  const router = useRouter();
  const [signing, setSigning] = useState(false);

  async function handleSignOut() {
    setSigning(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setSigning(false);
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={signing}
      className="text-xs text-[#6b5e56] hover:text-[#a89e96] transition-colors flex items-center gap-2 disabled:opacity-50"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      {signing ? "Signing out…" : "Sign out"}
    </button>
  );
}
