"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Globe,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowRight,
  FileText,
} from "lucide-react";

const applicantTypes = [
  {
    id: "student",
    title: "Student",
    icon: GraduationCap,
    description: "For full-time or part-time college students",
    href: "/apply/student",
    buttonLabel: "Apply as Student",
    color: "bg-[#1a73e8]",
    glowColor: "rgba(99,102,241,0.3)",
    documents: [
      "Passport size photo",
      "Student ID",
      "State ID or Passport",
      "Bank statement (past 3 months)",
      "Proof of income or financial aid",
      "Additional supporting documents (optional)",
    ],
  },
  {
    id: "international",
    title: "International Student",
    icon: Globe,
    description: "For non-U.S. citizens on a student visa",
    href: "/apply/student?type=international",
    buttonLabel: "Apply as International Student",
    color: "bg-[#1a73e8]",
    glowColor: "rgba(139,92,246,0.3)",
    documents: [
      "Passport size photo",
      "Student ID",
      "State ID or Passport",
      "Visa / I-20 documentation",
      "Bank statement (past 3 months)",
      "Proof of income or financial aid / sponsor letter",
      "Additional supporting documents (optional)",
    ],
  },
  {
    id: "professional",
    title: "Working Professional / Other",
    icon: Briefcase,
    description: "For employed individuals or general applicants.",
    href: "/apply/general",
    buttonLabel: "Start General Application",
    color: "bg-[#1a73e8]",
    glowColor: "rgba(6,182,212,0.3)",
    documents: [
      "Passport size photo",
      "State ID or Passport",
      "Visa (if applicable)",
      "Bank statement (past 3 months)",
      "Proof of income (pay stubs, employer letter, or offer letter)",
      "Additional supporting documents (optional)",
      "References (2-3 personal/professional)",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export default function ApplyPage() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">
                Apply for an Apartment
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the applicant type that best describes you to begin your
              application process. Each path is tailored to gather the right
              information for a smooth experience.
            </p>
          </motion.div>

          {/* Applicant Type Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {applicantTypes.map((type) => {
              const Icon = type.icon;
              const isExpanded = expandedCard === type.id;

              return (
                <motion.div
                  key={type.id}
                  variants={itemVariants}
                  className="glass group hover:border-blue-200 transition-all duration-500 flex flex-col"
                  style={{
                    boxShadow: `0 0 0px ${type.glowColor}`,
                    transition: "box-shadow 0.5s ease, border-color 0.5s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      `0 0 40px ${type.glowColor}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      `0 0 0px ${type.glowColor}`;
                  }}
                >
                  <div className="p-6 flex flex-col flex-1">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl ${type.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon size={28} className="text-white" />
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {type.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {type.description}
                    </p>

                    {/* Apply Button */}
                    <Link
                      href={type.href}
                      className="btn-glow text-center text-sm flex items-center justify-center gap-2 mb-4"
                    >
                      {type.buttonLabel}
                      <ArrowRight size={16} />
                    </Link>

                    {/* Expandable Documents Section */}
                    <button
                      onClick={() => toggleExpand(type.id)}
                      className="flex items-center justify-between w-full text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300 mt-auto pt-4 border-t border-gray-100"
                    >
                      <span className="flex items-center gap-2">
                        <FileText size={14} />
                        Required Documents
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isExpanded ? "auto" : 0,
                        opacity: isExpanded ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" as const }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-3 space-y-2">
                        {type.documents.map((doc, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-500 flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-[#1a73e8] mt-1.5 flex-shrink-0" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Info Alert Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glass p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-200">
                <Info size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Before You Begin
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Make sure you have all required documents ready before starting
                  your application. Having everything prepared will help you
                  complete the process quickly and avoid delays. The application
                  typically takes 15-20 minutes to complete.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
                >
                  View Application Guide
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
