"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Position above bottom nav on mobile, bottom corner on desktop */}
      <div
        className="fixed z-[9990] flex flex-col gap-2 items-center pointer-events-none"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {toasts.map((t) => (
          <ToastBubble key={t.id} item={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastBubble({ item }: { item: ToastItem }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const styles: Record<ToastType, string> = {
    success: "bg-[#28231c] text-white",
    error: "bg-red-600 text-white",
    info: "bg-[#28231c] text-white",
    warning: "bg-amber-600 text-white",
  };

  const icons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div
      className={`
        ${styles[item.type]}
        px-5 py-3 rounded-full text-sm font-medium shadow-lg
        flex items-center gap-2 pointer-events-auto whitespace-nowrap
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      role="alert"
      aria-live="polite"
    >
      <span className="font-bold text-base leading-none">{icons[item.type]}</span>
      {item.message}
    </div>
  );
}
