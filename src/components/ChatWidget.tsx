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
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
  ticketId?: string;
}

interface UserInfo {
  name: string;
  email: string;
  preferredTime: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the College Place assistant. Ask me about apartments, pricing, tours, or anything else. I can also help with maintenance requests — just describe the issue or send a photo!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

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
          userInfo: infoCollected ? userInfo : undefined,
        }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply || data.error,
        ticketId: data.ticketId,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // If a ticket was created, prompt for contact info (if not already given)
      if (data.ticketId && !infoCollected) {
        setShowInfoForm(true);
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

  async function handleImageUpload(file: File) {
    if (!file || loading) return;

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "That image is too large. Please use a photo under 4MB.",
        },
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
            userInfo: infoCollected ? userInfo : undefined,
          }),
        });
        const data = await res.json();
        const assistantMsg: Message = {
          role: "assistant",
          content: data.reply || data.error,
          ticketId: data.ticketId,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (data.ticketId && !infoCollected) {
          setShowInfoForm(true);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Couldn't analyze the image. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleInfoSubmit() {
    if (userInfo.name.trim() || userInfo.email.trim()) {
      setInfoCollected(true);
      setShowInfoForm(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Thanks${userInfo.name ? `, ${userInfo.name}` : ""}! Your contact info has been added to the ticket.${userInfo.preferredTime ? ` We'll try to reach you ${userInfo.preferredTime}.` : ""} Our team will follow up soon.`,
        },
      ]);
    } else {
      setShowInfoForm(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
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

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[540px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#1a73e8] text-white rounded-t-2xl shrink-0">
              <div>
                <p className="text-sm font-semibold m-0">
                  College Place Assistant
                </p>
                <p className="text-[11px] opacity-80 m-0">
                  Apartments, tours, maintenance & more
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors bg-transparent border-none cursor-pointer text-white"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
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

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#f3f4f6] px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                    <Loader2
                      size={14}
                      className="animate-spin text-[#6b7280]"
                    />
                    <span className="text-[12px] text-[#6b7280]">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}

              {/* Contact Info Form (after ticket creation) */}
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
                    onChange={(e) =>
                      setUserInfo((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-[12px] rounded-lg border border-blue-200 bg-white outline-none focus:border-[#1a73e8]"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo((p) => ({ ...p, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-[12px] rounded-lg border border-blue-200 bg-white outline-none focus:border-[#1a73e8]"
                  />
                  <div className="relative">
                    <Clock
                      size={12}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                    />
                    <input
                      type="text"
                      placeholder="Best time to contact (e.g., after 3pm, mornings)"
                      value={userInfo.preferredTime}
                      onChange={(e) =>
                        setUserInfo((p) => ({
                          ...p,
                          preferredTime: e.target.value,
                        }))
                      }
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
                      onClick={() => setShowInfoForm(false)}
                      className="px-4 py-2 text-[12px] text-[#6b7280] bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
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

// Render message content with basic markdown (bold, line breaks)
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
