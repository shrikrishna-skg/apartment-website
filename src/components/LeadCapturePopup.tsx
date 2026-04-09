"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Calendar, FileText, Phone } from "lucide-react";
import Link from "next/link";

const POPUP_DELAY_MS = 30000; // 30 seconds
const SCROLL_THRESHOLD = 0.5; // 50% of page
const SESSION_KEY = "cp_popup_shown";

export default function LeadCapturePopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const triggerPopup = useCallback(() => {
    if (dismissed) return;
    // Don't show if already shown this session
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) return;
    // Don't show on admin/dashboard pages
    if (typeof window !== "undefined" && window.location.pathname.includes("website-app")) return;
    // Don't show if already on apply, schedule-tour, lease-inquiry, or contact page
    const skipPaths = ["/apply", "/schedule-tour", "/lease-inquiry", "/contact", "/maintenance"];
    if (typeof window !== "undefined" && skipPaths.some((p) => window.location.pathname.startsWith(p))) return;

    setShow(true);
    if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, "1");
  }, [dismissed]);

  useEffect(() => {
    // Already shown this session?
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) return;

    // 1. Timed trigger
    const timer = setTimeout(triggerPopup, POPUP_DELAY_MS);

    // 2. Exit intent (mouse leaves viewport at top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && e.relatedTarget === null) {
        triggerPopup();
      }
    };

    // 3. Scroll trigger
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= SCROLL_THRESHOLD) {
        triggerPopup();
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [triggerPopup]);

  const handleClose = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90vw] max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white relative">
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 transition-colors bg-transparent border-none cursor-pointer text-white"
                >
                  <X size={18} />
                </button>
                <h2 className="text-xl font-bold mb-1 text-white">
                  Find Your Perfect Apartment 🏠
                </h2>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Near MTSU campus starting at just $500/month. Let us help you find your new home!
                </p>
              </div>

              {/* Options */}
              <div className="p-5 space-y-3">
                <Link
                  href="/schedule-tour"
                  onClick={handleClose}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer no-underline"
                >
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 m-0">Schedule a Tour</p>
                    <p className="text-xs text-gray-500 m-0 mt-0.5">Visit us and see the apartments in person</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </Link>

                <Link
                  href="/lease-inquiry"
                  onClick={handleClose}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer no-underline"
                >
                  <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                    <FileText size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 m-0">Submit a Lease Inquiry</p>
                    <p className="text-xs text-gray-500 m-0 mt-0.5">Get pricing details and availability</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-green-500 transition-colors" />
                </Link>

                <Link
                  href="/apply"
                  onClick={handleClose}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all group cursor-pointer no-underline"
                >
                  <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-700 m-0">Apply Now</p>
                    <p className="text-xs text-blue-600 m-0 mt-0.5">Start your application in 15 minutes</p>
                  </div>
                  <ArrowRight size={16} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
                </Link>

                <a
                  href="tel:6152000620"
                  onClick={handleClose}
                  className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mt-2 no-underline"
                >
                  <Phone size={14} />
                  Or call us at (615) 200-0620
                </a>
              </div>

              {/* Footer */}
              <div className="px-5 pb-4">
                <button
                  onClick={handleClose}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer py-1"
                >
                  No thanks, I&apos;m just browsing
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
