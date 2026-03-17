"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Phone, MessageSquare } from "lucide-react";
import { FAQS, SITE } from "@/data/site-data";

const CATEGORY_TABS = [
  "All",
  "Rent & Pricing",
  "Pets & Animals",
  "Leasing & Application",
  "Tours & Viewing",
  "Amenities & Features",
  "Roommates & Living",
];

const HELPFUL_LINKS = [
  { label: "Move-In Guide", href: "/move-in-guide" },
  { label: "Location Guide", href: "/location-guide" },
  { label: "Student Reviews", href: "/testimonials" },
  { label: "View Floor Plans", href: "/properties" },
  { label: "Schedule a Tour", href: "/schedule-tour" },
  { label: "Apply Now", href: "/apply" },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const filteredFAQs = FAQS.map((section) => ({
    ...section,
    questions: section.questions.filter(
      (item) =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }))
    .filter((section) =>
      activeCategory === "All" ? true : section.category === activeCategory
    )
    .filter((section) => section.questions.length > 0);

  const handleToggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-800">FAQ</span>
        </nav>

        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">
            <span className="text-gradient">Frequently Asked Questions</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about living at College Place near MTSU.
            Can&apos;t find your answer? Reach out to us directly.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-glass w-full pl-12"
          />
        </div>

        {/* Category Tabs */}
        <div className="mb-10 flex flex-wrap gap-2">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-[#1a73e8] text-white shadow-lg shadow-blue-200"
                  : "glass-subtle text-gray-700 hover:text-gray-900 hover:border-blue-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Sections */}
        {filteredFAQs.length === 0 && (
          <div className="glass py-16 text-center">
            <p className="text-lg text-gray-600">
              No questions found matching &quot;{searchTerm}&quot;. Try a
              different search term.
            </p>
          </div>
        )}

        {filteredFAQs.map((section) => (
          <div key={section.category} className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.questions.map((item, qIdx) => {
                const key = `${section.category}-${qIdx}`;
                const isOpen = openIndex === key;

                return (
                  <div key={key} className="glass overflow-hidden">
                    <button
                      onClick={() => handleToggle(key)}
                      className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="pr-4 font-medium text-gray-900">
                        {item.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="h-5 w-5 text-blue-600" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" as const }}
                        >
                          <div className="border-t border-gray-100 px-6 pb-5 pt-4">
                            <p className="leading-relaxed text-gray-600">
                              {item.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still Have Questions */}
        <div className="mt-16 glass p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Still have questions?
          </h2>
          <p className="mt-3 text-gray-600">
            Our team is here to help you find the perfect apartment near MTSU.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={`tel:${SITE.phone}`}
              className="btn-glow flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              {SITE.phone}
            </a>
            <Link
              href="/contact"
              className="btn-outline flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Send Us a Message
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {HELPFUL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
