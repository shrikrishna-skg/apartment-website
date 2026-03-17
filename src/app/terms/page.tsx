"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { SITE } from "@/data/site-data";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using the College Place Apartments website, submitting a lease application, or entering into a lease agreement, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, you should not use our services or website. These terms constitute a legally binding agreement between you and College Place Apartments, managed by College Place LLC. We reserve the right to update these terms at any time, and your continued use of our services constitutes acceptance of any changes.",
  },
  {
    title: "2. Lease Agreement",
    content:
      "All residents must sign a valid lease agreement before occupancy. Lease agreements outline the specific terms of your tenancy, including rental rate, lease duration, security deposit, move-in and move-out dates, and community policies. Individual leasing is available, meaning each tenant is responsible only for their own bedroom rent, not the full unit amount. Lease terms range from 6 to 18 months depending on availability and property. Lease renewal offers are provided at least 60 days before lease expiration. Breaking a lease early may result in fees as outlined in your lease agreement.",
  },
  {
    title: "3. Payment Terms",
    content:
      "Rent is due on the 1st of each month and is considered late after the 5th. Late payments are subject to a late fee as specified in your lease agreement. Payments can be made online through our resident portal, by check, or by money order at the leasing office. A security deposit equal to one month's rent is required at lease signing and is refundable at the end of the lease term, minus any deductions for damages beyond normal wear and tear. Returned check fees apply to any dishonored payments. Utilities are billed separately at $100 per person per month and include water, sewer, trash, internet, and cable TV.",
  },
  {
    title: "4. Property Use",
    content:
      "Residents agree to use the property solely for residential purposes. Commercial activities, subletting, or short-term rentals (such as Airbnb) are strictly prohibited without prior written consent from management. Residents are responsible for maintaining their unit in a clean and sanitary condition. Noise levels must be kept reasonable, and quiet hours are enforced from 10:00 PM to 8:00 AM daily. Smoking is prohibited inside all units and common areas. Grilling is only permitted in designated outdoor areas. Residents must not alter, paint, or make structural modifications to their unit without written approval.",
  },
  {
    title: "5. Maintenance",
    content:
      "College Place Apartments is committed to maintaining all properties in good condition. Residents may submit maintenance requests through our website, resident portal, or by contacting the leasing office. Emergency maintenance is available 24 hours a day, 7 days a week for urgent issues including flooding, gas leaks, and electrical hazards. Non-emergency requests are addressed within 3-5 business days. Residents are responsible for reporting maintenance issues promptly. Damage caused by resident negligence or misuse may be charged to the tenant. Routine maintenance and inspections may be conducted with at least 24 hours advance notice.",
  },
  {
    title: "6. Termination",
    content:
      "Either party may terminate the lease agreement according to the terms specified therein. Early termination by the resident may require a termination fee, typically equal to two months' rent, plus forfeiture of the security deposit. Written notice of at least 60 days is required for non-renewal at the end of a lease term. College Place reserves the right to terminate a lease for cause, including non-payment of rent, violation of community policies, illegal activity, or material breach of the lease agreement. Upon termination, residents must vacate the premises and return all keys and access devices within the specified timeframe.",
  },
  {
    title: "7. Liability",
    content:
      "College Place Apartments is not liable for personal injury, property damage, or loss of personal belongings unless caused by the gross negligence or willful misconduct of College Place or its employees. Residents are strongly encouraged to obtain renters insurance to protect personal property against theft, fire, water damage, and other covered perils. College Place is not responsible for interruptions in utility services, internet connectivity, or other amenities caused by factors beyond our reasonable control, including natural disasters, utility provider outages, or government actions. Residents are liable for any damage they or their guests cause to the property.",
  },
  {
    title: "8. Privacy",
    content:
      "Your use of our website and services is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. By agreeing to these Terms and Conditions, you also acknowledge our Privacy Policy. We are committed to safeguarding your personal data and will not sell or share your information with third parties for marketing purposes without your consent. For more details, please review our complete Privacy Policy available on our website.",
  },
  {
    title: "9. Governing Law",
    content:
      "These Terms and Conditions are governed by and construed in accordance with the laws of the State of Tennessee. Any disputes arising from these terms or your tenancy shall be resolved in the courts of Rutherford County, Tennessee. Both parties agree to attempt to resolve disputes through good-faith negotiation before pursuing legal action. If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect. These terms, together with your lease agreement, constitute the entire agreement between you and College Place Apartments.",
  },
  {
    title: "10. Contact",
    content: `For questions about these Terms and Conditions or any aspect of your tenancy, please contact us:\n\nCollege Place Apartments\n${SITE.address.full}\nPhone: ${SITE.phone}\nEmail: ${SITE.email}\n\nOffice Hours:\n${SITE.hours.weekday}\n${SITE.hours.weekend}`,
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
              Please read these terms carefully before using our services or
              entering into a lease agreement with College Place Apartments.
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
