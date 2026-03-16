"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { SITE, PROPERTIES } from "@/data/site-data";
import PropertyMap from "@/components/PropertyMap";

const subjectOptions = [
  "General Inquiry",
  "Property Information",
  "Maintenance",
  "Billing",
  "Other",
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validate = (): boolean => {
    const newErrors: string[] = [];
    if (!formData.fullName.trim()) newErrors.push("Full Name is required");
    if (!formData.email.trim()) newErrors.push("Email is required");
    if (!formData.message.trim()) newErrors.push("Message is required");
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
      const subjectToType: Record<string, string> = {
        "General Inquiry": "general",
        "Property Information": "lease",
        "Maintenance": "maintenance",
        "Billing": "pricing",
        "Other": "other",
      };
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          inquiry_type: subjectToType[formData.subject] || "general",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <>
        <div className="bg-ambient" />
        <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-10 text-center max-w-lg"
          >
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Message Sent!
            </h2>
            <p className="text-gray-500 mb-6">
              Thank you for reaching out. We&apos;ll get back to you as soon as
              possible, typically within 24 hours.
            </p>
            <a href="/" className="btn-glow inline-block">
              Return Home
            </a>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">Get In Touch</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Have a question or need assistance? We&apos;re here to help. Send
              us a message and our team will respond promptly.
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
              <form onSubmit={handleSubmit} className="glass p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Send Us a Message
                </h2>

                {/* Error Messages */}
                {errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 mb-6 rounded-xl"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                    }}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Full Name<span className="text-red-600 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      className="input-glass"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Email<span className="text-red-600 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      className="input-glass"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="input-glass"
                      placeholder="(615) 000-0000"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <select
                      className="input-glass"
                      value={formData.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                    >
                      <option value="" className="bg-white">
                        Select a subject...
                      </option>
                      {subjectOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5 mt-5">
                  <label className="text-sm font-medium text-gray-700">
                    Message<span className="text-red-600 ml-1">*</span>
                  </label>
                  <textarea
                    className="input-glass min-h-[150px] resize-y"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                  />
                </div>

                {submitError && (
                  <p className="text-red-600 text-sm mt-4">{submitError}</p>
                )}
                <button
                  type="submit"
                  className="btn-glow w-full flex items-center justify-center gap-2 text-base mt-6"
                  disabled={submitting}
                >
                  <Send size={18} />
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </motion.div>

            {/* Right Column - Contact Info & Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Contact Card */}
              <div className="glass p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5">
                  Contact Details
                </h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Clock size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Office Hours
                      </p>
                      <p className="text-sm text-gray-500">
                        {SITE.hours.weekday}
                      </p>
                      <p className="text-sm text-gray-500">
                        {SITE.hours.weekend}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Phone
                      </p>
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
                      <p className="text-sm font-medium text-gray-700">
                        Email
                      </p>
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
                      <MapPin size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Address
                      </p>
                      <p className="text-sm text-gray-500">
                        {SITE.address.street}
                      </p>
                      <p className="text-sm text-gray-500">
                        {SITE.address.city}, {SITE.address.state}{" "}
                        {SITE.address.zip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Map — all properties */}
              <PropertyMap properties={PROPERTIES} height={280} />
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
