"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { SITE } from "@/data/site-data";

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect personal information that you provide when interacting with our website or services. This may occur when you use features such as Schedule a Tour, Lease Inquiry, Maintenance Request, Refer a Friend, Apply Now (Rental Application), and Contact Us. The information collected may include your name, email address, phone number, and details related to your rental inquiry, application, tenant requests, or referrals. By checking the SMS consent checkbox on any of these forms, you expressly agree to receive SMS text messages from College Place Apartments at the phone number provided. Message frequency may vary. Msg & Data rates may apply. Reply STOP to opt out at any time. Reply HELP for help.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use your information to process rental applications, schedule property tours, respond to leasing inquiries, manage maintenance requests, communicate important property updates, and send service-related notifications such as rent reminders, maintenance updates, and leasing announcements. We may also use this information to improve our services and website experience and to comply with legal obligations.",
  },
  {
    title: "3. SMS Communication Policy",
    content:
      "College Place Apartments may use SMS text messaging to communicate with tenants and prospective residents regarding rent reminders, maintenance notifications, leasing updates, and community announcements. By providing your mobile phone number through our website forms, rental applications, or communication with our leasing office, you consent to receive SMS messages related to your inquiry or tenancy. Message frequency may vary depending on property updates or tenant communication. Standard message and data rates may apply.\n\nYou may opt out of SMS messages at any time by replying STOP. For assistance, reply HELP or contact our leasing office.",
  },
  {
    title: "4. Cookies and Tracking",
    content:
      "Our website may use cookies and similar technologies to improve user experience and analyze website traffic. Cookies help us understand how visitors use our website and allow us to enhance functionality. You can manage cookie settings through your web browser.",
  },
  {
    title: "5. Information Sharing",
    content:
      "We do not sell or rent your personal information. We may share information with trusted service providers only when necessary to operate our services, such as background screening providers or application processing services. Mobile phone numbers and SMS consent information will not be shared with third parties or affiliates for marketing or promotional purposes.",
  },
  {
    title: "6. Data Security",
    content:
      "We take reasonable administrative and technical measures to protect your personal information from unauthorized access, alteration, or disclosure.",
  },
  {
    title: "7. Your Privacy Choices",
    content:
      "You have the right to review, update, or delete your personal information by contacting our leasing office. We will make reasonable efforts to respond to your request in accordance with applicable laws.",
  },
  {
    title: "8. Children's Privacy",
    content:
      "Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13 years of age.",
  },
  {
    title: "9. Policy Updates",
    content:
      "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Updates will be posted on this page, and continued use of our website indicates acceptance of the revised policy.",
  },
  {
    title: "10. Contact Us",
    content: `For privacy-related inquiries, contact us at ${SITE.phone} or visit our office at ${SITE.address.full}.`,
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
              <Shield size={28} className="text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">Privacy Policy</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
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
