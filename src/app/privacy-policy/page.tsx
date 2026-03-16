"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { SITE } from "@/data/site-data";

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect personal information that you voluntarily provide when applying for a lease, scheduling a tour, submitting a maintenance request, or contacting us. This may include your full name, email address, phone number, mailing address, date of birth, Social Security Number (for background and credit checks), employment details, rental history, and student enrollment information. We also automatically collect certain technical data when you visit our website, including IP address, browser type, operating system, referring URLs, and pages visited.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use the information we collect to process lease applications, verify identity and background, communicate with you about your tenancy, respond to maintenance requests, process rent payments, send important property notices, improve our services and website experience, and comply with legal obligations. We may also use your contact information to send promotional offers about our properties, community events, and referral programs, which you can opt out of at any time.",
  },
  {
    title: "3. SMS Communication Policy",
    content:
      "By providing your phone number and opting in, you consent to receive SMS messages from College Place Apartments regarding lease updates, maintenance notifications, payment reminders, community announcements, and promotional offers. Message frequency varies. Message and data rates may apply. You can opt out at any time by replying STOP to any message. Reply HELP for assistance. Your phone number will not be shared with third parties for their marketing purposes. SMS consent is not a condition of lease agreement or any purchase.",
  },
  {
    title: "4. Cookies and Tracking",
    content:
      "Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand user behavior. These include essential cookies required for site functionality, analytics cookies (such as Google Analytics) to measure site performance, and functional cookies to remember your preferences. You can manage cookie preferences through your browser settings. Disabling certain cookies may limit your ability to use some features of our website. We do not use cookies to collect personally identifiable information without your consent.",
  },
  {
    title: "5. Information Sharing",
    content:
      "We do not sell, trade, or rent your personal information to third parties for marketing purposes. We may share your information with trusted service providers who assist in operating our business, such as background check services, payment processors, maintenance vendors, and utility providers. We may also disclose information when required by law, to protect our legal rights, or in connection with a merger, acquisition, or sale of assets. All third-party service providers are contractually obligated to protect your data and use it only for the purposes we specify.",
  },
  {
    title: "6. Data Security",
    content:
      "We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. This includes encryption of sensitive data in transit and at rest, secure server infrastructure, regular security assessments, and restricted access to personal information on a need-to-know basis. While we strive to protect your data, no method of electronic transmission or storage is 100% secure. We encourage you to use strong passwords and to contact us immediately if you suspect any unauthorized access to your account.",
  },
  {
    title: "7. Your Privacy Choices",
    content:
      "You have the right to access, correct, update, or delete your personal information at any time by contacting our leasing office. You may opt out of marketing emails by clicking the unsubscribe link in any promotional email. You may opt out of SMS communications by replying STOP. California residents may have additional rights under the CCPA, including the right to know what personal information is collected and the right to request its deletion. To exercise any of these rights, please contact us using the information provided below.",
  },
  {
    title: "8. Children's Privacy",
    content:
      "Our services and website are not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have inadvertently collected personal information from a child under 18, we will take steps to delete such information promptly. If you believe we have collected information from a minor, please contact us immediately so we can address the issue.",
  },
  {
    title: "9. Policy Updates",
    content:
      "We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, or legal requirements. When we make material changes, we will notify you by posting the updated policy on our website with a revised \"Last Updated\" date. We encourage you to review this policy periodically to stay informed about how we protect your information. Your continued use of our services after any changes constitutes your acceptance of the updated policy.",
  },
  {
    title: "10. Contact Us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:\n\nCollege Place Apartments\n${SITE.address.full}\nPhone: ${SITE.phone}\nEmail: ${SITE.email}\n\nWe aim to respond to all privacy-related inquiries within 30 business days.`,
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

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <div className="w-14 h-14 rounded-xl bg-[#1a73e8] flex items-center justify-center mx-auto mb-5">
              <Shield size={28} className="text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">Privacy Policy</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how College Place
              Apartments collects, uses, and protects your personal information.
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
