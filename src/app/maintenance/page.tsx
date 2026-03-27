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

const MAINTENANCE_SYSTEM_PROMPT = `You are the College Place Apartments Maintenance Assistant — a warm, empathetic, and professional AI that helps tenants submit maintenance requests.

YOUR GOAL: Collect all the information our maintenance team needs to take action efficiently. You need these 5 things before submitting:

REQUIRED INFORMATION (must have ALL before submitting):
1. APARTMENT NUMBER — Always ask if not provided. Never guess. Example: "First, what's your apartment number?"
2. ISSUE DESCRIPTION — Get clear, specific details. Ask follow-up questions. "Where exactly is the leak?" "Is it dripping or flowing?" "When did it start?"
3. CATEGORY — Determine from their description (plumbing, electrical, hvac, appliance, pest_control, structural, other)
4. URGENCY — Infer from context:
   - emergency: flooding, gas leak, fire, no heat in winter, electrical sparks, sewage, no hot water, broken lock/security issue
   - high: significantly impacts daily life, major appliance broken, AC out in summer
   - medium: needs attention this week but livable
   - low: cosmetic, minor, can wait
5. ENTRY PERMISSION & ACCESS — This is CRITICAL for staff. Ask naturally:
   "Is it okay for our maintenance team to enter your apartment during business hours (Mon-Sat 9am-5pm)? If you allow anytime access during those hours, it helps us fix it faster since the team can come as soon as they're available — no need to coordinate schedules!"
   - If they say yes to anytime → entry_permission: "anytime during business hours"
   - If they want to be present → ask what times work → entry_permission: their specified time
   - If they give a specific window → entry_permission: that window
6. CONTACT INFO — Ask for their name and email so our team can send updates:
   "What's your name and the best email to reach you? We'll send you updates on your request."
   - Always collect email. Default preferred contact method is EMAIL.
   - If they also mention a phone number, note it but email is primary.
   - If they don't want to share → that's okay, note "preferred not to share"

CONVERSATION STYLE:
- Be warm and genuinely caring. These are people dealing with problems in their HOME.
- Keep responses SHORT — 2-3 sentences per message. Don't write paragraphs.
- One question at a time. Don't overwhelm with multiple questions in one message.
- Use natural, human language. Not corporate or robotic.

CONVERSATION FLOW (follow this order):
1. If no apartment number → ask for it first
2. If apartment given but issue unclear → ask what's going on
3. If issue described but vague → ask ONE clarifying question (where exactly? how bad? when did it start?)
4. If issue is clear → empathize, then ask about entry permission
5. Once you have ALL 5 pieces → confirm details and submit

EMPATHY & SENTIMENT:
- Frustrated/angry tenant → "I completely understand how frustrating that is. Let's get this sorted out for you right away."
- Worried tenant → "I hear you — let me make sure our team sees this quickly."
- Emergency detected → "⚠️ This sounds urgent! While I submit this request, please also call (615) 200-0620 right now for immediate help."
- Casual/minor issue → Match their energy. Keep it light and helpful.

SMART BEHAVIOR:
- If they say "hi" or greet you → respond warmly and ask for their apartment number
- If they jump straight to the issue without apartment → empathize first, then ask for apartment
- If they describe an emergency → skip the pleasantries, acknowledge urgency, still get apartment number
- "Water everywhere" = plumbing emergency. "Weird smell from outlet" = electrical high. "Roach" = pest_control.
- If they mention they already called the office → acknowledge that and still help create the ticket for documentation
- After submitting, ask "Is there anything else I can help with?"

NEVER DO:
- Never submit without apartment number
- Never submit without a clear issue description
- Never submit without asking about entry permission
- Never guess apartment numbers
- Never promise specific repair times ("we'll fix it today") — say "our team will review and reach out within 24 hours"
- Never give pricing, lease, or tour info — redirect: "I'm your maintenance assistant! For leasing questions, visit collegeplace.us or call (615) 200-0620."

WHEN YOU HAVE ALL 6 PIECES (apartment, description, category, urgency, entry_permission, contact):
First, confirm with the tenant: "Let me confirm — you're in [apartment], experiencing [brief issue]. Our team can enter [entry permission]. We'll send updates to [email]. Submitting now!"
Then end your message with this exact marker on its own line:
[SUBMIT_MAINTENANCE]
apartment: <unit number>
category: <plumbing|electrical|hvac|appliance|pest_control|structural|other>
urgency: <low|medium|high|emergency>
description: <clear 1-2 sentence summary of the issue>
entry_permission: <their stated preference>
tenant_name: <their name or "Not provided">
tenant_email: <their email or "Not provided">
[/SUBMIT_MAINTENANCE]

Office: (615) 200-0620 | office@collegeplace.us | Mon-Sat 9am-5pm`;

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
      text: "Hey there! 👋 I'm here to help with any maintenance issues in your apartment. What's your apartment number?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  const [chatFiles, setChatFiles] = useState<File[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 50);
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && pendingFiles.length === 0) || loading) return;

    let imageAnalysis = "";
    const filesToProcess = [...pendingFiles];

    // Handle pending files — analyze images with Gemini
    if (filesToProcess.length > 0) {
      setChatFiles((prev) => [...prev, ...filesToProcess]);
      const fileNames = filesToProcess.map((f) => f.name).join(", ");
      setMessages((prev) => [
        ...prev,
        { role: "user", text: `📷 Sent ${filesToProcess.length} photo${filesToProcess.length > 1 ? "s" : ""}: ${fileNames}` },
      ]);
      setPendingFiles([]);
      setPendingPreviews([]);

      // Analyze ALL images with Gemini
      const imageFiles = filesToProcess.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length > 0) {
        setLoading(true);
        const analyzingText = `🔍 Analyzing ${imageFiles.length} photo${imageFiles.length > 1 ? "s" : ""}...`;
        setMessages((prev) => [...prev, { role: "bot", text: analyzingText }]);
        const analyses: string[] = [];
        for (const imageFile of imageFiles) {
          try {
            const base64 = await fileToBase64(imageFile);
            const imgRes = await fetch("/api/chat/image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                image: base64,
                mimeType: imageFile.type,
                message: inputValue.trim() || "Maintenance issue photo from tenant",
              }),
            });
            const imgData = await imgRes.json();
            if (imgData.reply) {
              analyses.push(imgData.reply.replace(/\[SUGGEST_TICKET\]/g, "").trim());
            }
          } catch {
            // Skip failed analysis
          }
        }
        if (analyses.length > 0) {
          imageAnalysis = analyses.join("\n\n");
          const displayText = analyses.length === 1
            ? `📸 **Photo Analysis:** ${analyses[0]}`
            : analyses.map((a, i) => `📸 **Photo ${i + 1}:** ${a}`).join("\n\n");
          // Replace "Analyzing..." with the actual analysis
          setMessages((prev) => {
            const updated = [...prev];
            let analyzeIdx = -1;
            for (let k = updated.length - 1; k >= 0; k--) { if (updated[k].text === analyzingText) { analyzeIdx = k; break; } }
            if (analyzeIdx >= 0) {
              updated[analyzeIdx] = { role: "bot", text: displayText };
            }
            return updated;
          });
        } else {
          setMessages((prev) => prev.filter((m) => m.text !== analyzingText));
        }
      }
    }

    const userText = inputValue.trim();
    if (userText) {
      setMessages((prev) => [...prev, { role: "user", text: userText }]);
    }
    setInputValue("");
    setLoading(true);

    try {
      // Build conversation history for AI (include image analysis as context)
      const allMessages = [
        ...messages.filter((m) => m.text && m.text !== "🔍 Analyzing your photo..."),
        ...(imageAnalysis ? [{ role: "bot" as const, text: `Photo Analysis: ${imageAnalysis}` }] : []),
        ...(userText ? [{ role: "user" as const, text: userText }] : []),
      ];

      const aiMessages = allMessages.map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
      }));

      // If only image was sent (no text), add context for the AI
      if (!userText && imageAnalysis) {
        aiMessages.push({
          role: "user",
          content: "I just sent a photo of the issue. Please review the analysis above and help me submit a maintenance request.",
        });
      }

      // Call the chat API with maintenance system prompt
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: aiMessages,
          systemPromptOverride: MAINTENANCE_SYSTEM_PROMPT,
        }),
      });

      const data = await res.json();
      let reply = data.reply || "I'm sorry, I couldn't process that. Please try again.";

      // Check if AI wants to submit a maintenance ticket
      const submitMatch = reply.match(/\[SUBMIT_MAINTENANCE\]([\s\S]*?)\[\/SUBMIT_MAINTENANCE\]/);
      if (submitMatch && !ticketSubmitted) {
        const details = submitMatch[1];
        const apartment = details.match(/apartment:\s*(.+)/i)?.[1]?.trim() || "";
        const category = details.match(/category:\s*(.+)/i)?.[1]?.trim() || "other";
        const urgency = details.match(/urgency:\s*(.+)/i)?.[1]?.trim() || "medium";
        const description = details.match(/description:\s*(.+)/i)?.[1]?.trim() || "";
        const entryPermission = details.match(/entry_permission:\s*(.+)/i)?.[1]?.trim() || "not specified";
        const tenantName = details.match(/tenant_name:\s*(.+)/i)?.[1]?.trim() || "Chat User";
        const tenantEmail = details.match(/tenant_email:\s*(.+)/i)?.[1]?.trim() || "";

        // Remove the marker from the display reply
        reply = reply.replace(/\[SUBMIT_MAINTENANCE\][\s\S]*?\[\/SUBMIT_MAINTENANCE\]/, "").trim();

        // Submit to maintenance API
        try {
          const maintRes = await fetch("/api/maintenance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              apartment,
              full_name: tenantName,
              email: tenantEmail || "chat@collegeplace.us",
              category,
              description: description +
                `\n\nEntry Permission: ${entryPermission}` +
                `\nPreferred Contact: Email${tenantEmail ? ` (${tenantEmail})` : ""}` +
                (chatFiles.length > 0 ? `\n[${chatFiles.length} photo(s) attached]` : ""),
              urgency,
            }),
          });
          const maintData = await maintRes.json();

          // Upload attached files
          if (chatFiles.length > 0 && maintData.id) {
            for (const file of chatFiles) {
              const fileForm = new FormData();
              fileForm.append("file", file);
              fileForm.append("application_id", maintData.id);
              fileForm.append("document_label", "Maintenance Photo");
              await fetch("/api/documents/upload", { method: "POST", body: fileForm }).catch(() => {});
            }
          }

          setTicketSubmitted(true);
          reply += `\n\n✅ **Maintenance request submitted!** Our team will review this and reach out within 24 hours.`;
          if (urgency === "emergency") {
            reply += `\n\n⚠️ Since this is an emergency, please also call **(615) 200-0620** right away.`;
          }
        } catch {
          reply += "\n\n(There was an issue submitting automatically. Please call (615) 200-0620 to report this.)";
        }
      }

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again or call us at (615) 200-0620." },
      ]);
    }
    setLoading(false);
  };

  // Shared function to add files with preview generation
  const addFilesToPending = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setPendingFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setPendingPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs and other files, no image preview
        setPendingPreviews((prev) => [...prev, ""]);
      }
    });
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    addFilesToPending(Array.from(files));
    e.target.value = "";
  };

  // Handle paste (Ctrl+V / Cmd+V) for images and files
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const pastedFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          // Give pasted images a better name
          const ext = file.type.split("/")[1] || "png";
          const namedFile = new File([file], `pasted-image-${Date.now()}.${ext}`, { type: file.type });
          pastedFiles.push(namedFile);
        }
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault();
      addFilesToPending(pastedFiles);
    }
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
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
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                  className="glass flex flex-col overflow-hidden"
                  style={{ height: "calc(100vh - 180px)" }}
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
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4" style={{ minHeight: 0 }}>
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
                            {msg.role === "bot" ? renderMd(msg.text) : msg.text}
                          </div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="flex items-end gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1a73e8] flex items-center justify-center flex-shrink-0">
                            <Bot size={14} className="text-white" />
                          </div>
                          <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-50 border border-gray-200">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-gray-100 shrink-0">
                    {/* Pending file previews - shown above input before sending */}
                    {pendingFiles.length > 0 && (
                      <div className="px-4 pt-3 pb-1">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {pendingFiles.map((file, idx) => (
                            <div key={idx} className="relative shrink-0">
                              {pendingPreviews[idx] ? (
                                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-200 bg-gray-50">
                                  <img
                                    src={pendingPreviews[idx]}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-lg border-2 border-blue-200 bg-blue-50 flex flex-col items-center justify-center">
                                  <Paperclip size={14} className="text-blue-500" />
                                  <span className="text-[8px] text-blue-600 mt-0.5 max-w-[50px] truncate">{file.name}</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removePendingFile(idx)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 shadow-sm"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} ready — press Send or Enter to attach
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-3">
                      {/* Hidden file inputs */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xlsx,.xls,.txt,.heic,.heif,.webp,.bmp,.tiff,.svg"
                        multiple
                        className="hidden"
                        onChange={handleFileAttach}
                      />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileAttach}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                        title="Attach a file"
                      >
                        <Paperclip size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                        title="Take a photo"
                      >
                        <Camera size={18} />
                      </button>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder="Type or paste an image..."
                        disabled={loading}
                        className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-[#f9fafb] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]/20 transition-all disabled:opacity-50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() && pendingFiles.length === 0}
                        className="w-10 h-10 shrink-0 rounded-full bg-[#1a73e8] flex items-center justify-center text-white hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
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
                        <p className="text-sm text-gray-600 mb-1">
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
                        <p className="text-sm text-gray-600">Our maintenance team will contact you shortly.</p>
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
                      <p className="text-gray-600 text-xs">Maintenance Emergency</p>
                      <p className="text-gray-800 font-medium">{SITE.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-600 text-xs">Fire / Police / Medical</p>
                      <p className="text-gray-800 font-medium">911</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-600 text-xs">Leasing Office</p>
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
                  <p className="text-xs text-gray-500 leading-relaxed">
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

/* Simple markdown renderer for bot messages */
/* Convert file to base64 for Gemini analysis */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(",")[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* Simple markdown renderer for bot messages */
function renderMd(text: string) {
  // Split by newlines, handle bold (**text**), and basic formatting
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    // Replace **bold** with <strong>
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {i > 0 && <br />}
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
      </span>
    );
  });
}
