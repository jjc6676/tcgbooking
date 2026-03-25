"use client";

import Link from "next/link";
import QuickBlockSheet from "@/components/QuickBlockSheet";

export default function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-2 mb-5">
      {/* Add Appointment */}
      <Link
        href="/admin/appointments?action=create"
        className="flex items-center gap-2 bg-white border border-[#e8e2dc] rounded-xl px-3 py-3 text-sm font-medium text-[#5c4a42] hover:border-[#9b6f6f] hover:bg-[#fdf8f6] active:scale-[0.98] transition-all min-h-[48px]"
      >
        <div className="w-7 h-7 rounded-lg bg-[#e8f5e8] flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-[#4a7c59]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        Add Appointment
      </Link>

      {/* Block Time */}
      <QuickBlockSheet />

      {/* Log Walk-in */}
      <Link
        href="/admin/clients"
        className="flex items-center gap-2 bg-white border border-[#e8e2dc] rounded-xl px-3 py-3 text-sm font-medium text-[#5c4a42] hover:border-[#9b6f6f] hover:bg-[#fdf8f6] active:scale-[0.98] transition-all min-h-[48px]"
      >
        <div className="w-7 h-7 rounded-lg bg-[#f0ebe6] flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        Log Walk-in
      </Link>

      {/* Manage Services */}
      <Link
        href="/admin/services"
        className="flex items-center gap-2 bg-white border border-[#e8e2dc] rounded-xl px-3 py-3 text-sm font-medium text-[#5c4a42] hover:border-[#9b6f6f] hover:bg-[#fdf8f6] active:scale-[0.98] transition-all min-h-[48px]"
      >
        <div className="w-7 h-7 rounded-lg bg-[#f5ede8] flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-[#9b6f6f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        Manage Services
      </Link>
    </div>
  );
}
