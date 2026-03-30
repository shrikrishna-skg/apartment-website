"use client";

import { useEffect, useState } from "react";

export interface ToastData {
  message: string;
  type: "success" | "error" | "info";
}

export function useSonarToast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (message: string, type: ToastData["type"] = "success") => {
    setToast({ message, type });
  };

  return { toast, setToast, showToast };
}

export default function SonarToast({
  toast,
  onClose,
}: {
  toast: ToastData | null;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (toast) {
      setExiting(false);
      // Small delay for enter animation
      requestAnimationFrame(() => setVisible(true));
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setVisible(false);
          onClose();
        }, 300);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const colors = {
    success: {
      bg: "bg-gray-900",
      ring: "ring-green-500/30",
      icon: "text-green-400",
      sonar: "bg-green-500",
    },
    error: {
      bg: "bg-gray-900",
      ring: "ring-red-500/30",
      icon: "text-red-400",
      sonar: "bg-red-500",
    },
    info: {
      bg: "bg-gray-900",
      ring: "ring-blue-500/30",
      icon: "text-blue-400",
      sonar: "bg-blue-500",
    },
  };

  const c = colors[toast.type];

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 ease-out ${
        visible && !exiting
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95"
      }`}
    >
      <div
        className={`flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl ${c.bg} ring-1 ${c.ring} shadow-2xl shadow-black/20 backdrop-blur-xl min-w-[280px] max-w-[420px]`}
      >
        {/* Sonar dot */}
        <div className="relative flex items-center justify-center shrink-0">
          <span className={`w-2.5 h-2.5 rounded-full ${c.sonar}`} />
          <span
            className={`absolute w-2.5 h-2.5 rounded-full ${c.sonar} animate-ping opacity-75`}
          />
        </div>

        {/* Message */}
        <p className="text-sm font-medium text-white flex-1">{toast.message}</p>

        {/* Close */}
        <button
          onClick={() => {
            setExiting(true);
            setTimeout(() => {
              setVisible(false);
              onClose();
            }, 200);
          }}
          className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors shrink-0"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
