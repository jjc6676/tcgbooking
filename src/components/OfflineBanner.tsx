"use client";

import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    const handleOffline = () => { setOffline(true); setShowing(true); };
    const handleOnline = () => {
      setOffline(false);
      setTimeout(() => setShowing(false), 2000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Check initial state
    if (!navigator.onLine) {
      setOffline(true);
      setShowing(true);
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!showing) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        offline
          ? "bg-[#28231c] text-white"
          : "bg-emerald-600 text-white"
      }`}
      role="alert"
      aria-live="polite"
    >
      {offline ? (
        <>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 8.464a5 5 0 000 7.072M5.636 5.636a9 9 0 000 12.728" />
          </svg>
          You&apos;re offline — check your connection
        </>
      ) : (
        <>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Back online ✓
        </>
      )}
    </div>
  );
}
