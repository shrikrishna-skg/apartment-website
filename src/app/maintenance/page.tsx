"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  FileText,
  Send,
  Paperclip,
  Camera,
  Phone,
  Clock,
  AlertTriangle,
  Upload,
  ChevronRight,
  Bot,
  User,
} from "lucide-react";
import { SITE } from "@/data/site-data";

interface Message {
  role: "bot" | "user";
  text: string;
}

const botResponses = [
  "Thanks! Now, can you describe the issue you're experiencing?",
  "Got it. How urgent is this issue? (Low, Medium, High, or Emergency)",
  "Thank you! Your maintenance request has been submitted successfully. Our team will reach out within 24 hours. If this is an emergency, please call us directly at " +
    SITE.phone +
    ".",
];

const issueCategories = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliance",
  "Pest Control",
  "Other",
];

const urgencyLevels = [
  { value: "low", label: "Low", description: "Can wait a few days" },
  { value: "medium", label: "Medium", description: "Needs attention this week" },
  { value: "high", label: "High", description: "Needs attention today" },
  { value: "emergency", label: "Emergency", description: "Immediate danger or damage" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<"chat" | "form">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I'll help you submit a maintenance request. What's your apartment number?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [botResponseIndex, setBotResponseIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    apartment: "",
    fullName: "",
    email: "",
    phone: "",
    category: "",
    urgency: "",
    description: "",
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // Chat state for collecting maintenance info
  const [chatData, setChatData] = useState({ apartment: "", description: "", urgency: "" });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: "user", text: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);

    // Collect data from chat responses
    const updatedChatData = { ...chatData };
    if (botResponseIndex === 0) updatedChatData.apartment = inputValue.trim();
    if (botResponseIndex === 1) updatedChatData.description = inputValue.trim();
    if (botResponseIndex === 2) updatedChatData.urgency = inputValue.trim().toLowerCase();
    setChatData(updatedChatData);

    setInputValue("");

    if (botResponseIndex < botResponses.length) {
      const responseText = botResponses[botResponseIndex];
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "bot", text: responseText }]);
      }, 1000);

      // On the last bot response (urgency collected), submit to API
      if (botResponseIndex === 2) {
        const urgencyMap: Record<string, string> = {
          low: "low", medium: "medium", high: "high", emergency: "emergency",
        };
        const urgencyValue = urgencyMap[updatedChatData.urgency] || "medium";
        fetch("/api/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apartment: updatedChatData.apartment,
            full_name: "Chat User",
            email: "chat@collegeplace.us",
            description: updatedChatData.description,
            urgency: urgencyValue,
          }),
        }).catch(() => {});
      }

      setBotResponseIndex((prev) => prev + 1);
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "Your request is already submitted. For additional help, please call us at " + SITE.phone + ".",
          },
        ]);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apartment: formData.apartment,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          category: formData.category || null,
          urgency: formData.urgency || "medium",
          description: formData.description,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit request");
      }
      setFormSubmitted(true);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
    setFormSubmitting(false);
  };

  return (
    <>
      <div className="bg-ambient" />
      <main className="min-h-screen pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">Maintenance Request</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Submit a maintenance request using our AI chat assistant or the
              traditional form. We aim to respond within 24 hours.
            </p>
          </motion.div>

          {/* Tab Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-10"
          >
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeTab === "chat"
                  ? "bg-[#1a73e8] text-white shadow-lg shadow-blue-200"
                  : "glass text-gray-500 hover:text-gray-900 hover:border-blue-200"
              }`}
            >
              <MessageSquare size={18} />
              AI Chat Assistant
            </button>
            <button
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeTab === "form"
                  ? "bg-[#1a73e8] text-white shadow-lg shadow-blue-200"
                  : "glass text-gray-500 hover:text-gray-900 hover:border-blue-200"
              }`}
            >
              <FileText size={18} />
              Traditional Form
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {activeTab === "chat" ? (
                /* Chat Interface */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="glass flex flex-col"
                  style={{ height: "600px" }}
                >
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a73e8] flex items-center justify-center">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Maintenance Assistant
                      </p>
                      <p className="text-xs text-green-600">Online</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-end gap-2 max-w-[80%] ${
                            msg.role === "user"
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              msg.role === "user"
                                ? "bg-gradient-to-br from-cyan-500 to-blue-500"
                                : "bg-[#1a73e8]"
                            }`}
                          >
                            {msg.role === "user" ? (
                              <User size={14} className="text-white" />
                            ) : (
                              <Bot size={14} className="text-white" />
                            )}
                          </div>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              msg.role === "user"
                                ? "bg-[#1a73e8] text-white rounded-br-sm"
                                : "bg-gray-50 border border-gray-200 text-gray-700 rounded-bl-sm"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200">
                        <Paperclip size={18} />
                      </button>
                      <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200">
                        <Camera size={18} />
                      </button>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="input-glass flex-1"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="w-10 h-10 rounded-full bg-[#1a73e8] flex items-center justify-center text-white hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Traditional Form */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="glass p-6 sm:p-8"
                >
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Apartment Number *
                        </label>
                        <input
                          type="text"
                          name="apartment"
                          value={formData.apartment}
                          onChange={handleFormChange}
                          required
                          placeholder="e.g., 204"
                          className="input-glass"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleFormChange}
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
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          required
                          placeholder="you@example.com"
                          className="input-glass"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="(555) 123-4567"
                          className="input-glass"
                        />
                      </div>
                    </div>

                    {/* Issue Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Issue Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="input-glass"
                      >
                        <option value="">Select a category</option>
                        {issueCategories.map((cat) => (
                          <option key={cat} value={cat.toLowerCase()}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Urgency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Urgency
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {urgencyLevels.map((level) => (
                          <label
                            key={level.value}
                            className={`glass-subtle p-3 text-center cursor-pointer transition-all duration-300 ${
                              formData.urgency === level.value
                                ? "border-blue-300 bg-blue-50"
                                : "hover:border-white/15"
                            }`}
                          >
                            <input
                              type="radio"
                              name="urgency"
                              value={level.value}
                              checked={formData.urgency === level.value}
                              onChange={handleFormChange}
                              className="sr-only"
                            />
                            <p
                              className={`text-sm font-semibold mb-0.5 ${
                                formData.urgency === level.value
                                  ? "text-blue-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {level.label}
                            </p>
                            <p className="text-xs text-gray-400">
                              {level.description}
                            </p>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        required
                        rows={4}
                        placeholder="Please describe the issue in detail..."
                        className="input-glass resize-none"
                      />
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Attach Photos
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-200 transition-colors duration-300 cursor-pointer">
                        <Upload
                          size={32}
                          className="text-gray-400 mx-auto mb-3"
                        />
                        <p className="text-sm text-gray-500 mb-1">
                          Drag & drop files here or click to browse
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, or PDF up to 10MB
                        </p>
                      </div>
                    </div>

                    {/* Error */}
                    {formError && (
                      <p className="text-red-600 text-sm">{formError}</p>
                    )}

                    {/* Submit */}
                    {formSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-3">
                          <Send size={20} className="text-white" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 mb-1">Request Submitted!</p>
                        <p className="text-sm text-gray-500">Our maintenance team will contact you shortly.</p>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className="btn-glow w-full text-center"
                        disabled={formSubmitting}
                      >
                        {formSubmitting ? "Submitting..." : "Submit Request"}
                      </button>
                    )}
                  </form>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Emergency Contacts */}
              <motion.div variants={itemVariants} className="glass p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-600" />
                  Emergency Contacts
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Maintenance Emergency</p>
                      <p className="text-gray-800 font-medium">{SITE.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Fire / Police / Medical</p>
                      <p className="text-gray-800 font-medium">911</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Leasing Office</p>
                      <p className="text-gray-800 font-medium">{SITE.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-300 leading-relaxed">
                    For gas leaks, flooding, or fire emergencies, call 911
                    immediately and then contact our emergency maintenance line.
                  </p>
                </div>
              </motion.div>

              {/* Office Hours */}
              <motion.div variants={itemVariants} className="glass p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-blue-600" />
                  Office Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monday - Saturday</span>
                    <span className="text-gray-800">9am - 5pm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sunday</span>
                    <span className="text-gray-800">Closed</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    After-hours emergency maintenance is available 24/7. Non-urgent
                    requests submitted outside office hours will be addressed the
                    next business day.
                  </p>
                </div>
              </motion.div>

              {/* Quick Info */}
              <motion.div variants={itemVariants} className="glass p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Response Times
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Emergency</span>
                    <span className="text-red-600 font-medium">Immediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">High</span>
                    <span className="text-orange-400 font-medium">Same Day</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Medium</span>
                    <span className="text-yellow-400 font-medium">1-3 Days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Low</span>
                    <span className="text-green-600 font-medium">3-5 Days</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
