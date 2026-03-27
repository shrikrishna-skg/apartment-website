"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Zap,
  ClipboardList,
  Home,
  MessageSquare,
} from "lucide-react";
import { SITE, PROPERTIES } from "@/data/site-data";
import DatePicker from "@/components/ui/DatePicker";

const bedroomOptions = [
  "Studio",
  "1 Bedroom",
  "2 Bedrooms",
  "3 Bedrooms",
  "4 Bedrooms",
];

const leaseTermOptions = ["6 Months", "12 Months", "18 Months", "24 Months"];

const budgetOptions = [
  "Under $500",
  "$500 - $700",
  "$700 - $900",
  "$900+",
];

const whatsNextItems = [
  { icon: ClipboardList, text: "We review your inquiry details" },
  { icon: Home, text: "Schedule a property tour" },
  { icon: MessageSquare, text: "Discuss available floor plans" },
  { icon: CheckCircle2, text: "Start your application" },
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  preferredProperty: string;
  moveInDate: string;
  bedrooms: string;
  leaseTerm: string;
  budget: string;
  isMTSUStudent: boolean;
  hasPets: boolean;
  numberOfRoommates: string;
  comments: string;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  preferredProperty: "",
  moveInDate: "",
  bedrooms: "",
  leaseTerm: "",
  budget: "",
  isMTSUStudent: false,
  hasPets: false,
  numberOfRoommates: "",
  comments: "",
};

export default function LeaseInquiryPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validate = (): boolean => {
    const newErrors: string[] = [];
    if (!formData.fullName.trim()) newErrors.push("Full Name is required");
    if (!formData.email.trim()) newErrors.push("Email is required");
    if (!formData.phone.trim()) newErrors.push("Phone is required");
    if (!formData.bedrooms) newErrors.push("Bedrooms selection is required");
    if (!formData.leaseTerm) newErrors.push("Lease Term is required");
    if (!formData.budget) newErrors.push("Budget is required");
    if (!consent) newErrors.push("You must consent to communications");
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          property_slug: formData.preferredProperty || null,
          inquiry_type: "lease",
          consent_communications: consent,
          message: [
            `Move-in: ${formData.moveInDate || "Not specified"}`,
            `Bedrooms: ${formData.bedrooms}`,
            `Lease: ${formData.leaseTerm}`,
            `Budget: ${formData.budget}`,
            `MTSU Student: ${formData.isMTSUStudent ? "Yes" : "No"}`,
            `Pets: ${formData.hasPets ? "Yes" : "No"}`,
            `Roommates: ${formData.numberOfRoommates || "None"}`,
            formData.comments ? `Comments: ${formData.comments}` : "",
          ].filter(Boolean).join("\n"),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit inquiry");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setSubmitting(false);
  };

  const renderInput = (
    label: string,
    field: keyof FormData,
    type = "text",
    placeholder = "",
    required = false
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        type={type}
        className="input-glass"
        placeholder={placeholder}
        value={formData[field] as string}
        onChange={(e) => updateField(field, e.target.value)}
      />
    </div>
  );

  const renderSelect = (
    label: string,
    field: keyof FormData,
    options: string[],
    required = false,
    defaultLabel = "Select..."
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <select
        className="input-glass"
        value={formData[field] as string}
        onChange={(e) => updateField(field, e.target.value)}
      >
        <option value="" className="bg-white">
          {defaultLabel}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-white">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  if (submitted) {
    return (
      <>
        <div className="bg-ambient" />
        <main className="min-h-screen pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-10 text-center max-w-lg"
          >
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Inquiry Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your lease inquiry. Our team will review your
              preferences and get back to you within 24 hours.
            </p>
            <Link href="/" className="btn-glow inline-block">
              Return Home
            </Link>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">Lease Inquiry</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Interested in leasing with us? Fill out the form below and
              we&apos;ll help you find the perfect apartment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSubmit}>
                {/* Error Messages */}
                {errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-4 mb-6"
                    style={{ borderColor: "rgba(239,68,68,0.3)" }}
                  >
                    <p className="text-red-600 text-sm font-medium mb-1">
                      Please fix the following:
                    </p>
                    <ul className="list-disc list-inside text-red-600/80 text-sm space-y-0.5">
                      {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Section 1: Personal Info */}
                <div className="glass p-6 sm:p-8 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-200">
                      <span className="text-blue-600 text-sm font-bold">1</span>
                    </div>
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {renderInput("Full Name", "fullName", "text", "John Doe", true)}
                    {renderInput("Email", "email", "email", "you@email.com", true)}
                    <div className="sm:col-span-2">
                      {renderInput("Phone", "phone", "tel", "(615) 000-0000", true)}
                    </div>
                  </div>
                </div>

                {/* Section 2: Lease Preferences */}
                <div className="glass p-6 sm:p-8 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-200">
                      <span className="text-purple-600 text-sm font-bold">2</span>
                    </div>
                    Lease Preferences
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {renderSelect(
                      "Preferred Property",
                      "preferredProperty",
                      [
                        ...PROPERTIES.map((p) => p.name),
                        "Any Available",
                      ],
                      false,
                      "Select a property..."
                    )}
                    <DatePicker
                      label="Move-In Date"
                      value={formData.moveInDate}
                      onChange={(val) => updateField("moveInDate", val)}
                      minDate={new Date()}
                      placeholder="Select move-in date"
                    />
                    {renderSelect("Bedrooms", "bedrooms", bedroomOptions, true, "Select bedrooms...")}
                    {renderSelect("Lease Term", "leaseTerm", leaseTermOptions, true, "Select term...")}
                    {renderSelect("Budget", "budget", budgetOptions, true, "Select budget range...")}
                  </div>
                </div>

                {/* Section 3: Additional Information */}
                <div className="glass p-6 sm:p-8 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-200">
                      <span className="text-teal-600 text-sm font-bold">3</span>
                    </div>
                    Additional Information
                  </h2>
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            formData.isMTSUStudent
                              ? "bg-[#1a73e8] border-[#1a73e8]"
                              : "border-gray-300 group-hover:border-[#1a73e8]"
                          }`}
                          onClick={() =>
                            updateField("isMTSUStudent", !formData.isMTSUStudent)
                          }
                        >
                          {formData.isMTSUStudent && (
                            <CheckCircle2 size={14} className="text-white" />
                          )}
                        </div>
                        <span
                          className="text-sm text-gray-700"
                          onClick={() =>
                            updateField("isMTSUStudent", !formData.isMTSUStudent)
                          }
                        >
                          I am an MTSU Student
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            formData.hasPets
                              ? "bg-[#1a73e8] border-[#1a73e8]"
                              : "border-gray-300 group-hover:border-[#1a73e8]"
                          }`}
                          onClick={() =>
                            updateField("hasPets", !formData.hasPets)
                          }
                        >
                          {formData.hasPets && (
                            <CheckCircle2 size={14} className="text-white" />
                          )}
                        </div>
                        <span
                          className="text-sm text-gray-700"
                          onClick={() =>
                            updateField("hasPets", !formData.hasPets)
                          }
                        >
                          I have pets
                        </span>
                      </label>
                    </div>

                    {renderInput(
                      "Number of Roommates",
                      "numberOfRoommates",
                      "number",
                      "0"
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Comments or Questions
                      </label>
                      <textarea
                        className="input-glass min-h-[100px] resize-y"
                        placeholder="Any additional comments, questions, or special requirements..."
                        value={formData.comments}
                        onChange={(e) =>
                          updateField("comments", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Consent & Communications */}
                <div className="mt-6 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      By submitting this form, I consent to receive communications from College Place Apartments including emails, phone calls, and text messages at the number provided. I understand that message & data rates may apply, message frequency varies, and I can opt out at any time by replying STOP. Consent is not a condition of purchase or tenancy. View our{" "}
                      <a href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</a>
                      {" "}and{" "}
                      <a href="/terms" className="text-blue-600 underline hover:text-blue-800">Terms & Conditions</a>.
                    </span>
                  </label>
                </div>

                {submitError && (
                  <p className="text-red-600 text-sm mb-4">{submitError}</p>
                )}
                <button
                  type="submit"
                  className="btn-glow w-full flex items-center justify-center gap-2 text-base"
                  disabled={submitting}
                >
                  <Send size={18} />
                  {submitting ? "Submitting..." : "Submit Lease Inquiry"}
                </button>
              </form>
            </motion.div>

            {/* Right Column - Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Contact Info Card */}
              <div className="glass p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Address
                      </p>
                      <p className="text-sm text-gray-600">
                        {SITE.address.full}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <a
                        href={`tel:${SITE.phone}`}
                        className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                      >
                        {SITE.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <a
                        href={`mailto:${SITE.email}`}
                        className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                      >
                        {SITE.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Clock size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Office Hours
                      </p>
                      <p className="text-sm text-gray-600">
                        {SITE.hours.weekday}
                      </p>
                      <p className="text-sm text-gray-600">
                        {SITE.hours.weekend}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="glass p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center border border-green-200">
                    <Zap size={18} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Response Time
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  We typically respond to all lease inquiries within{" "}
                  <span className="text-green-600 font-medium">24 hours</span>.
                  For urgent requests, please call us directly.
                </p>
              </div>

              {/* What's Next */}
              <div className="glass p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  What&apos;s Next?
                </h3>
                <div className="space-y-3">
                  {whatsNextItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                          <Icon size={14} className="text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
