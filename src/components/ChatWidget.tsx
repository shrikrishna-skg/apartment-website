"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  ImagePlus,
  Loader2,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Ticket,
  ChevronRight,
} from "lucide-react";

/* ── Types ── */
interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

interface TicketPreview {
  issue: string;
  urgency: "emergency" | "high" | "normal";
  unitInfo?: string | null;
  preferredTime?: string | null;
  availability?: string | null;
  userName?: string | null;
  imageDescription?: string | null;
}

interface CreatedTicket {
  ticketId: string;
  urgency: string;
  userName: string;
  unitInfo?: string | null;
  preferredTime?: string | null;
  availability?: string | null;
  summary: string;
  createdAt: string;
}

interface UserInfo {
  name: string;
  email: string;
  preferredTime: string;
}

/* ── Component ── */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi there! I'm the College Place assistant. I'm here to help with anything — apartment questions, pricing, tours, maintenance issues, or even just figuring out what's right for you. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Ticket flow state
  const [pendingTicket, setPendingTicket] = useState<TicketPreview | null>(null);
  const [pendingImageData, setPendingImageData] = useState<{
    hasImage: boolean;
    imageDescription?: string;
  } | null>(null);
  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(null);
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Contact info
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    email: "",
    preferredTime: "",
  });
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [infoCollected, setInfoCollected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingTicket, createdTicket, showInfoForm, scrollToBottom]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  /* ── Send text message ── */
  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages
            .filter((m) => !m.image)
            .map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || data.error },
      ]);

      // If AI suggests a ticket, show the confirmation card
      if (data.suggestTicket && data.ticketPreview) {
        setPendingTicket(data.ticketPreview);
        setPendingImageData(null);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again or call us at (615) 200-0620.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ── Image upload ── */
  async function handleImageUpload(file: File) {
    if (!file || loading) return;

    if (file.size > 4 * 1024 * 1024) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "That image is too large. Please use a photo under 4MB." },
      ]);
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const userMsg: Message = {
        role: "user",
        content: input || "Sent a photo",
        image: reader.result as string,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      try {
        const res = await fetch("/api/chat/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64,
            mimeType: file.type,
            message: input || "",
          }),
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || data.error },
        ]);

        if (data.suggestTicket && data.ticketPreview) {
          setPendingTicket(data.ticketPreview);
          setPendingImageData({
            hasImage: true,
            imageDescription: data.imageDescription,
          });
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Couldn't analyze the image. Please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  /* ── Confirm ticket creation ── */
  async function confirmTicket() {
    if (!pendingTicket || creatingTicket) return;
    setCreatingTicket(true);

    try {
      const conversation = messages
        .slice(-10)
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const res = await fetch("/api/chat/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketPreview: pendingTicket,
          conversation,
          userInfo: infoCollected ? userInfo : undefined,
          hasImage: pendingImageData?.hasImage,
          imageDescription: pendingImageData?.imageDescription,
        }),
      });
      const data = await res.json();

      if (data.ticketId) {
        setCreatedTicket(data);
        setPendingTicket(null);
        setPendingImageData(null);

        // Show contact info form if not already collected
        if (!infoCollected) {
          setShowInfoForm(true);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, there was an issue creating the ticket. Please try again or call (615) 200-0620." },
        ]);
        setPendingTicket(null);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Couldn't create the ticket right now. Please call (615) 200-0620 for immediate help." },
      ]);
      setPendingTicket(null);
    } finally {
      setCreatingTicket(false);
    }
  }

  /* ── Decline ticket ── */
  function declineTicket() {
    setPendingTicket(null);
    setPendingImageData(null);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "No problem at all. If you change your mind or need anything else, I'm right here.",
      },
    ]);
  }

  /* ── Submit contact info ── */
  function handleInfoSubmit() {
    if (userInfo.name.trim() || userInfo.email.trim()) {
      setInfoCollected(true);
      setShowInfoForm(false);

      // Update ticket with contact info (fire-and-forget)
      if (createdTicket?.ticketId) {
        fetch("/api/chat/ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketPreview: { issue: createdTicket.summary, urgency: createdTicket.urgency },
            userInfo,
            conversation: "",
          }),
        }).catch(() => {});
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Thanks${userInfo.name ? `, ${userInfo.name}` : ""}! Your info has been added to the ticket.${userInfo.preferredTime ? ` We'll aim to reach you ${userInfo.preferredTime}.` : ""} Our team will follow up soon.`,
        },
      ]);
    } else {
      setShowInfoForm(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "No worries! Our team will review the ticket and follow up. Is there anything else I can help with?" },
      ]);
    }
  }

  /* ── Urgency helpers ── */
  function getUrgencyConfig(urgency: string) {
    switch (urgency) {
      case "emergency":
        return { label: "Emergency", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle };
      case "high":
        return { label: "High Priority", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Zap };
      default:
        return { label: "Normal", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: Ticket };
    }
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1a73e8] text-white shadow-lg hover:bg-[#1557b0] transition-colors flex items-center justify-center border-none cursor-pointer"
            aria-label="Open chat"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#1a73e8] text-white rounded-t-2xl shrink-0">
              <div>
                <p className="text-sm font-semibold m-0">College Place Assistant</p>
                <p className="text-[11px] opacity-80 m-0">Here to help — apartments, tours, maintenance</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors bg-transparent border-none cursor-pointer text-white"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#1a73e8] text-white rounded-br-md"
                        : "bg-[#f3f4f6] text-[#1f2937] rounded-bl-md"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Uploaded"
                        className="w-full max-h-40 object-cover rounded-lg mb-2"
                      />
                    )}
                    {renderContent(msg.content)}
                  </div>
                </div>
              ))}

              {/* Loading */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#f3f4f6] px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[#6b7280]" />
                    <span className="text-[12px] text-[#6b7280]">Thinking...</span>
                  </div>
                </div>
              )}

              {/* ── Ticket Confirmation Card ── */}
              {pendingTicket && !createdTicket && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <Ticket size={14} className="text-[#1a73e8]" />
                    <span className="text-[12px] font-semibold text-[#1f2937]">Create a ticket?</span>
                  </div>
                  <div className="px-4 py-3 space-y-2.5">
                    {/* Issue */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] font-semibold m-0">Issue</p>
                      <p className="text-[12px] text-[#374151] m-0 mt-0.5 leading-relaxed">{pendingTicket.issue.slice(0, 150)}{pendingTicket.issue.length > 150 ? "..." : ""}</p>
                    </div>
                    {/* Urgency */}
                    {(() => {
                      const urg = getUrgencyConfig(pendingTicket.urgency);
                      const Icon = urg.icon;
                      return (
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] font-semibold m-0 w-16">Urgency</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${urg.bg} ${urg.color} ${urg.border} border`}>
                            <Icon size={10} />
                            {urg.label}
                          </span>
                        </div>
                      );
                    })()}
                    {/* Unit */}
                    {pendingTicket.unitInfo && (
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] font-semibold m-0 w-16">Unit</p>
                        <p className="text-[12px] text-[#374151] m-0">{pendingTicket.unitInfo}</p>
                      </div>
                    )}
                    {/* Image analysis */}
                    {pendingTicket.imageDescription && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] font-semibold m-0">Photo Analysis</p>
                        <p className="text-[11px] text-[#6b7280] m-0 mt-0.5 italic leading-relaxed">{pendingTicket.imageDescription.slice(0, 120)}...</p>
                      </div>
                    )}
                  </div>
                  {/* Confirm / Decline buttons */}
                  <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={confirmTicket}
                      disabled={creatingTicket}
                      className="flex-1 py-2 text-[12px] font-semibold bg-[#1a73e8] text-white rounded-lg border-none cursor-pointer hover:bg-[#1557b0] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      {creatingTicket ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={12} />
                          Yes, create ticket
                        </>
                      )}
                    </button>
                    <button
                      onClick={declineTicket}
                      disabled={creatingTicket}
                      className="px-4 py-2 text-[12px] text-[#6b7280] bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                      No thanks
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Created Ticket Snapshot ── */}
              {createdTicket && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-emerald-200 rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span className="text-[12px] font-semibold text-emerald-800">Ticket Created Successfully</span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wide text-[#9ca3af] font-semibold">Ticket ID</span>
                      <span className="text-[13px] font-bold text-[#1a73e8] font-mono">{createdTicket.ticketId}</span>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] font-semibold m-0">Status</p>
                        <p className="text-[11px] text-emerald-700 font-semibold m-0 mt-0.5">Open</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] font-semibold m-0">Urgency</p>
                        {(() => {
                          const urg = getUrgencyConfig(createdTicket.urgency);
                          const Icon = urg.icon;
                          return (
                            <span className={`inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold ${urg.color}`}>
                              <Icon size={10} />
                              {urg.label}
                            </span>
                          );
                        })()}
                      </div>
                      {createdTicket.unitInfo && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] font-semibold m-0">Unit</p>
                          <p className="text-[11px] text-[#374151] m-0 mt-0.5">{createdTicket.unitInfo}</p>
                        </div>
                      )}
                      {createdTicket.preferredTime && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] font-semibold m-0">Contact Time</p>
                          <p className="text-[11px] text-[#374151] m-0 mt-0.5">{createdTicket.preferredTime}</p>
                        </div>
                      )}
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] font-semibold m-0">Summary</p>
                      <p className="text-[11px] text-[#374151] m-0 mt-0.5 leading-relaxed">{createdTicket.summary.slice(0, 200)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg px-3 py-2 flex items-start gap-2 mt-1">
                      <ChevronRight size={12} className="text-[#1a73e8] mt-0.5 shrink-0" />
                      <p className="text-[11px] text-[#1a73e8] m-0 leading-relaxed">
                        Email notification sent to our office team. They&apos;ll review and respond promptly.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Contact Info Form (after ticket creation) ── */}
              {showInfoForm && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3"
                >
                  <p className="text-[12px] font-semibold text-[#1a73e8] m-0 flex items-center gap-1.5">
                    <User size={13} />
                    Add your info for faster follow-up (optional)
                  </p>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 text-[12px] rounded-lg border border-blue-200 bg-white outline-none focus:border-[#1a73e8]"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 text-[12px] rounded-lg border border-blue-200 bg-white outline-none focus:border-[#1a73e8]"
                  />
                  <div className="relative">
                    <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                    <input
                      type="text"
                      placeholder="Best time to contact (e.g., after 3pm, mornings)"
                      value={userInfo.preferredTime}
                      onChange={(e) => setUserInfo((p) => ({ ...p, preferredTime: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-blue-200 bg-white outline-none focus:border-[#1a73e8]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleInfoSubmit}
                      className="flex-1 py-2 text-[12px] font-semibold bg-[#1a73e8] text-white rounded-lg border-none cursor-pointer hover:bg-[#1557b0] transition-colors"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setShowInfoForm(false);
                        setMessages((prev) => [
                          ...prev,
                          { role: "assistant", content: "No worries! Our team will review the ticket and follow up. Anything else I can help with?" },
                        ]);
                      }}
                      className="px-4 py-2 text-[12px] text-[#6b7280] bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Bar ── */}
            <div className="px-3 py-3 border-t border-gray-100 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="p-2 rounded-lg text-[#6b7280] hover:bg-gray-100 hover:text-[#1a73e8] transition-colors bg-transparent border-none cursor-pointer disabled:opacity-40"
                  aria-label="Upload image"
                  title="Send a photo"
                >
                  <ImagePlus size={18} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about apartments, pricing, tours..."
                  disabled={loading}
                  className="flex-1 px-3 py-2.5 text-[13px] rounded-xl border border-gray-200 bg-[#f9fafb] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]/20 transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Render message with basic markdown (bold, line breaks) ── */
function renderContent(text: string) {
  return text.split("\n").map((line, i, arr) => (
    <span key={i}>
      {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={j}>{part}</span>;
      })}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}
