import { NextRequest, NextResponse } from "next/server";
import { chatWithGroq, shouldCreateTicket, extractTicketDetails } from "@/lib/ai";
import { sendTicketEmail } from "@/lib/email";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { messages, userInfo } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
    const reply = await chatWithGroq(messages);

    // Auto-ticket for maintenance/issues
    if (lastUserMsg && shouldCreateTicket(lastUserMsg.content)) {
      const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
      const details = extractTicketDetails(messages);
      const conversationSummary = messages
        .slice(-8)
        .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
        .join("\n");

      // Save to Supabase
      try {
        await supabase.from("chat_tickets").insert({
          ticket_id: ticketId,
          user_name: details.userName || userInfo?.name || "Website Visitor",
          user_email: userInfo?.email || "N/A",
          category: "chat-auto",
          urgency: details.urgency,
          unit_info: details.unitInfo,
          preferred_time: details.preferredTime,
          availability: details.availability,
          summary: lastUserMsg.content.slice(0, 300),
          conversation: conversationSummary,
          ai_response: reply,
          status: "open",
        });
      } catch {
        // DB insert is best-effort
      }

      // Send professional ticket email
      try {
        await sendTicketEmail({
          ticketId,
          urgency: details.urgency,
          category: "chat-auto",
          userName: details.userName || userInfo?.name || "Website Visitor",
          userEmail: userInfo?.email || "N/A",
          unitInfo: details.unitInfo,
          preferredTime: details.preferredTime,
          availability: details.availability,
          summary: lastUserMsg.content.slice(0, 300),
          conversation: conversationSummary,
          aiResponse: reply,
        });
      } catch {
        // Email is best-effort
      }

      const urgencyNote = details.urgency === "emergency"
        ? "\n🚨 This has been flagged as **EMERGENCY** — our team will prioritize this."
        : details.urgency === "high"
        ? "\n⚡ Marked as **high priority** — we'll get on this quickly."
        : "";

      return NextResponse.json({
        reply: `${reply}\n\n📋 Ticket **${ticketId}** created and our office team has been notified.${urgencyNote}`,
        ticketId,
        urgency: details.urgency,
      });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
