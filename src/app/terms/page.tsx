"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const sections = [
  {
    title: "1. Agreement to Terms",
    content:
      "By accessing and using the College Place Apartments website, you agree to comply with and be bound by these Terms and Conditions.",
  },
  {
    title: "2. Use License",
    content:
      "Permission is granted to temporarily download or view materials from our website for personal, non-commercial use only. This license does not transfer ownership, and users may not reproduce, distribute, modify, or use the materials for commercial purposes without written permission.",
  },
  {
    title: "3. Disclaimer",
    content:
      'The information on the College Place Apartments website are provided on an "as-is" basis. We make no warranties, expressed or implied, regarding the accuracy, reliability, or availability on the website.',
  },
  {
    title: "4. Limitations",
    content:
      "College Place Apartments will not be liable for any damages arising from the use or inability to use the materials on this website. This includes, but is not limited to, damages related to loss of data or service interruptions.",
  },
  {
    title: "5. Accuracy of Materials",
    content:
      "The materials appearing on this website may include technical, typographical, or photographic errors. College Place Apartments does not guarantee that the information on the website is always accurate, complete, or current.",
  },
  {
    title: "6. Links",
    content:
      "Our website may contain links to third-party websites that are not controlled by College Place Apartments. We are not responsible for the content, policies, or practices of these external sites.",
  },
  {
    title: "7. SMS Messaging Terms",
    content:
      "By providing your phone number to College Place Apartments, you agree that we may contact you via SMS regarding leasing inquiries, tenant services, and property updates. Message frequency may vary. Standard message and data rates may apply. You may opt out at any time by replying STOP, and for assistance reply HELP.",
  },
  {
    title: "8. Modifications",
    content:
      "College Place Apartments may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.",
  },
  {
    title: "9. Governing Law",
    content:
      "These Terms and Conditions are governed by the laws of the State of Tennessee. Any disputes related to the use of this website will be subject to the jurisdiction of the courts located in Tennessee.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

export default function TermsPage() {
  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <div className="w-14 h-14 rounded-xl bg-[#1a73e8] flex items-center justify-center mx-auto mb-5">
              <FileText size={28} className="text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">Terms & Conditions</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Please read these terms carefully before using our website and services.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last Updated: March 2026
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="glass p-6 sm:p-10"
          >
            <div className="space-y-10">
              {sections.map((section) => (
                <motion.div key={section.title} variants={itemVariants}>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {section.title}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
