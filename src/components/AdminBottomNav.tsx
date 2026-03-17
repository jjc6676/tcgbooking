"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  pendingCount: number;
}

const NAV_TABS = [
  {
    href: "/admin",
    label: "Schedule",
    exact: true,
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-[#9b6f6f]" : "text-[#8a7e78]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/appointments",
    label: "Requests",
    exact: false,
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-[#9b6f6f]" : "text-[#8a7e78]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    href: "/admin/services",
    label: "Services",
    exact: false,
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-[#9b6f6f]" : "text-[#8a7e78]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "/admin/hours",
    label: "Hours",
    exact: false,
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-[#9b6f6f]" : "text-[#8a7e78]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5}
          d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/profile",
    label: "Profile",
    exact: false,
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-[#9b6f6f]" : "text-[#8a7e78]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function AdminBottomNav({ pendingCount }: Props) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e8e2dc] lg:hidden">
      <div className="flex items-stretch">
        {NAV_TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href) && !(tab.href === "/admin" && pathname !== "/admin");
          const isRequests = tab.href === "/admin/appointments";

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-colors ${
                active ? "text-[#9b6f6f]" : "text-[#8a7e78]"
              }`}
            >
              <div className="relative">
                {tab.icon(active)}
                {isRequests && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 bg-[#d97706] text-white text-[9px] font-bold rounded-full px-1">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-medium tracking-wide ${active ? "text-[#9b6f6f]" : "text-[#8a7e78]"}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#9b6f6f] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area spacer for notched phones */}
      <div className="h-safe-area-inset-bottom bg-white" style={{ height: "env(safe-area-inset-bottom)" }} />
    </nav>
  );
}
