"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, TENANT_LINKS, SITE } from "@/data/site-data";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tenantOpen, setTenantOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change using popstate listener
  useEffect(() => {
    const handleRouteChange = () => setMobileOpen(false);
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-200/80 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src={SITE.logo}
              alt={`${SITE.name} logo`}
              width={32}
              height={32}
              priority
              className="rounded-sm h-8 w-auto"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-tight text-[#1f2937]">
                {SITE.name}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#4b5563] -mt-px">
                {SITE.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const isApply = link.label === "Apply Now";

              if (isApply) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="ml-3 px-6 py-2 text-sm font-semibold rounded-full bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-[#1a73e8] bg-blue-50"
                      : "text-[#4b5563] hover:text-[#1f2937] hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Tenant Dropdown */}
            <div
              className="relative ml-1"
              onMouseEnter={() => setTenantOpen(true)}
              onMouseLeave={() => setTenantOpen(false)}
            >
              <button
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg text-[#4b5563] hover:text-[#1f2937] hover:bg-gray-100 transition-colors duration-200 bg-transparent border-none cursor-pointer"
                onClick={() => setTenantOpen(!tenantOpen)}
              >
                Tenant
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    tenantOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Dropdown Menu — outer wrapper includes pt-1 so hover gap is bridged */}
              <div
                className={`absolute top-full right-0 pt-1 w-56 transition-all duration-200 origin-top-right ${
                  tenantOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                }`}
              >
                <div className="py-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                  {TENANT_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2.5 text-sm text-[#4b5563] hover:text-[#1f2937] hover:bg-gray-50 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-[#4b5563] hover:bg-gray-100 transition-colors duration-200 bg-transparent border-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Scrim / Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              style={{ top: 64 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              className="lg:hidden fixed top-16 right-0 bottom-0 w-72 bg-white border-l border-gray-200 z-50 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Close button */}
              <div className="flex justify-end px-4 pt-3 pb-1">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-[#4b5563] hover:bg-gray-100 transition-colors duration-200 bg-transparent border-none cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col px-2 pb-6 gap-0.5">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  const isApply = link.label === "Apply Now";

                  if (isApply) {
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block mx-2 mt-2 px-5 py-3 text-sm font-semibold text-center rounded-full bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "text-[#1a73e8] bg-blue-50"
                          : "text-[#4b5563] hover:text-[#1f2937] hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* Tenant Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="block px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#4b5563]">
                    Tenant Portal
                  </span>
                  {TENANT_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-3 text-sm text-[#4b5563] hover:text-[#1f2937] hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
