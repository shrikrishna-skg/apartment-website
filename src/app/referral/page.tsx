"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Users,
  Phone as PhoneIcon,
  Gift,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  UserPlus,
  Mail,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { SITE } from "@/data/site-data";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

const steps = [
  {
    icon: Send,
    title: "Submit Referral",
    description:
      "Fill out the referral form with your info and your friend's details. It only takes a minute.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: PhoneIcon,
    title: "We Reach Out",
    description:
      "Our leasing team contacts your friend to share available options and schedule a tour.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Gift,
    title: "Earn Reward",
    description:
      "When your friend signs a lease, you both receive a referral bonus. It's a win-win!",
    color: "from-cyan-500 to-blue-500",
  },
];

const referralFAQs = [
  {
    q: "How much is the referral reward?",
    a: "Current residents receive a $200 rent credit for each successful referral when the referred friend signs a lease and moves in. Your friend also gets a $100 move-in discount.",
  },
  {
    q: "Is there a limit to how many friends I can refer?",
    a: "No! There is no limit. Refer as many friends as you'd like and earn rewards for each successful lease signing.",
  },
  {
    q: "When do I receive my referral reward?",
    a: "Referral credits are applied to your account within 30 days of your friend's move-in date and lease activation.",
  },
  {
    q: "Can I refer someone who already toured or applied?",
    a: "Referrals must be submitted before your friend's first contact with our leasing office. Previously contacted prospects are not eligible.",
  },
  {
    q: "Do both parties need to be current residents?",
    a: "Only the referring person needs to be a current College Place resident. The referred friend can be anyone looking for an apartment near MTSU.",
  },
];

const referralTerms = [
  "Referrer must be a current resident of College Place Apartments with an active lease at the time of referral and reward payout.",
  "Referred friend must be a new prospect who has not previously contacted, toured, or applied to College Place.",
  "Referral reward is issued as a rent credit within 30 days after the referred friend signs a lease and completes move-in.",
  "College Place reserves the right to modify or discontinue the referral program at any time without prior notice.",
  "Referral rewards cannot be combined with other promotions or converted to cash. Maximum one referral credit per referred tenant.",
];

export default function ReferralPage() {
  const [formData, setFormData] = useState({
    yourName: "",
    yourEmail: "",
    yourPhone: "",
    yourUnit: "",
    preferredContact: "email",
    relationship: "friend",
    friendName: "",
    friendEmail: "",
    friendPhone: "",
    moveInTimeline: "",
    budgetRange: "",
    occupants: "",
    notes: "",
  });
  const [consentShare, setConsentShare] = useState(false);
  const [consentContact, setConsentContact] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentShare || !consentContact) {
      setSubmitError("Please agree to both consent checkboxes before submitting.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrer_name: formData.yourName,
          referrer_email: formData.yourEmail,
          referrer_phone: formData.yourPhone,
          referrer_unit: formData.yourUnit,
          preferred_contact: formData.preferredContact,
          relationship: formData.relationship,
          friend_name: formData.friendName,
          friend_email: formData.friendEmail || null,
          friend_phone: formData.friendPhone || null,
          move_in_timeline: formData.moveInTimeline || null,
          budget_range: formData.budgetRange || null,
          occupants: formData.occupants || null,
          notes: formData.notes || null,
          consent_share: consentShare,
          consent_contact: consentContact,
          consent_communications: consentShare,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit referral");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
              <Gift size={14} />
              Earn Rewards
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5">
              <span className="text-gradient">Refer a Friend to College Place</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Love living at College Place? Share the experience with your friends and
              earn rewards when they sign a lease. It&apos;s simple, fast, and rewarding.
            </p>
          </motion.div>

          {/* How It Works */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 text-center mb-10"
            >
              How It Works
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    variants={itemVariants}
                    className="glass p-6 text-center relative group hover:border-blue-200 transition-all duration-500"
                  >
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-sm font-bold text-white">
                      {idx + 1}
                    </div>
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Referral Form */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="glass p-6 sm:p-10 mb-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Submit Your Referral
            </h2>
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Your Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <UserPlus size={18} className="text-blue-600" />
                  Your Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="yourName"
                      value={formData.yourName}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="yourEmail"
                      value={formData.yourEmail}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="yourPhone"
                      value={formData.yourPhone}
                      onChange={handleChange}
                      required
                      placeholder="(555) 123-4567"
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Unit Number *
                    </label>
                    <input
                      type="text"
                      name="yourUnit"
                      value={formData.yourUnit}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 204"
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Preferred Contact Method
                    </label>
                    <select
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleChange}
                      className="input-glass"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="call">Call</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Relationship
                    </label>
                    <select
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                      className="input-glass"
                    >
                      <option value="friend">Friend</option>
                      <option value="classmate">Classmate</option>
                      <option value="family">Family</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Friend's Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <Users size={18} className="text-teal-600" />
                  Friend&apos;s Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="friendName"
                      value={formData.friendName}
                      onChange={handleChange}
                      required
                      placeholder="Friend's full name"
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      name="friendEmail"
                      value={formData.friendEmail}
                      onChange={handleChange}
                      placeholder="friend@example.com"
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="friendPhone"
                      value={formData.friendPhone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Move-In Timeline
                    </label>
                    <select
                      name="moveInTimeline"
                      value={formData.moveInTimeline}
                      onChange={handleChange}
                      className="input-glass"
                    >
                      <option value="">Select timeline</option>
                      <option value="this-month">This month</option>
                      <option value="next-month">Next month</option>
                      <option value="2-3-months">2-3 months</option>
                      <option value="4-plus-months">4+ months</option>
                      <option value="not-sure">Not sure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Budget Range
                    </label>
                    <select
                      name="budgetRange"
                      value={formData.budgetRange}
                      onChange={handleChange}
                      className="input-glass"
                    >
                      <option value="">Select budget</option>
                      <option value="under-500">Under $500/mo</option>
                      <option value="500-700">$500 - $700/mo</option>
                      <option value="700-900">$700 - $900/mo</option>
                      <option value="900-plus">$900+/mo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Number of Occupants
                    </label>
                    <select
                      name="occupants"
                      value={formData.occupants}
                      onChange={handleChange}
                      className="input-glass"
                    >
                      <option value="">Select</option>
                      <option value="1">1 person</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5+">5+ people</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        handleChange(e);
                      }
                    }}
                    rows={3}
                    placeholder="Anything else we should know about your friend's housing needs..."
                    className="input-glass resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {formData.notes.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentShare}
                    onChange={(e) => setConsentShare(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-200 bg-gray-50 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed">
                    I give permission to share my contact information with the
                    College Place leasing team for the purpose of processing this
                    referral. I consent to receive communications including emails, phone calls, and text messages at the number provided. Message & data rates may apply, message frequency varies, and I can opt out at any time by replying STOP. Consent is not a condition of purchase or tenancy. View our{" "}
                    <a href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</a>
                    {" "}and{" "}
                    <a href="/terms" className="text-blue-600 underline hover:text-blue-800">Terms & Conditions</a>.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentContact}
                    onChange={(e) => setConsentContact(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-200 bg-gray-50 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed">
                    My friend agrees to be contacted by the College Place leasing
                    team regarding available apartments and tour scheduling via emails, phone calls, and text messages. Message & data rates may apply. Reply STOP to opt out.
                  </span>
                </label>
              </div>

              {/* Error */}
              {submitError && (
                <p className="text-red-600 text-sm">{submitError}</p>
              )}

              {/* Submit */}
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-white" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2">Referral Submitted!</p>
                  <p className="text-gray-600 text-sm">
                    Thank you! Our team will reach out to your friend soon.
                    You&apos;ll receive a confirmation email shortly.
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  className="btn-glow w-full text-center flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Referral"}
                  {!submitting && <ArrowRight size={18} />}
                </button>
              )}
            </form>
          </motion.section>

          {/* FAQ Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 text-center mb-8"
            >
              Frequently Asked Questions
            </motion.h2>
            <div className="space-y-3">
              {referralFAQs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="glass overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-sm font-semibold text-gray-900 pr-4">
                      {faq.q}
                    </span>
                    {openFAQ === idx ? (
                      <ChevronUp size={18} className="text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFAQ === idx ? "auto" : 0,
                      opacity: openFAQ === idx ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" as const }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Terms Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="glass p-6 sm:p-8"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Referral Program Terms
            </h2>
            <ol className="space-y-3">
              {referralTerms.map((term, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  {term}
                </li>
              ))}
            </ol>
          </motion.section>
        </div>
      </main>
    </>
  );
}
