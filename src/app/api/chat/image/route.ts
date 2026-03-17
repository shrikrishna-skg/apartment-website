import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini, extractTicketDetails } from "@/lib/ai";
import { sendTicketEmail } from "@/lib/email";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType, message, userInfo } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    const reply = await analyzeImageWithGemini(
      image,
      mimeType || "image/jpeg",
      message || ""
    );

    // Detect issues from user message + AI analysis
    const combined = `${message || ""} ${reply}`;
    const isIssue = /damage|broken|leak|mold|crack|pest|stain|hole|water.?mark|rust|peeling|loose|missing|chip|dent|burn|scorch|discolor|clog|overflow|exposed.?wire/i.test(combined);

    if (isIssue) {
      const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
      const fakeMessages = [
        { role: "user", content: message || "Photo uploaded" },
        { role: "assistant", content: reply },
      ];
      const details = extractTicketDetails(fakeMessages);
      const conversation = `user: [uploaded image] ${message || ""}\nassistant: ${reply}`;

      try {
        await supabase.from("chat_tickets").insert({
          ticket_id: ticketId,
          user_name: details.userName || userInfo?.name || "Website Visitor",
          user_email: userInfo?.email || "N/A",
          category: "image-report",
          urgency: details.urgency,
          unit_info: details.unitInfo,
          preferred_time: details.preferredTime,
          availability: details.availability,
          has_image: true,
          image_description: reply.slice(0, 500),
          summary: `Photo report: ${(message || "Image uploaded for review").slice(0, 300)}`,
          conversation,
          ai_response: reply,
          status: "open",
        });
      } catch {
        // best-effort
      }

      // Send professional ticket email with image analysis
      try {
        await sendTicketEmail({
          ticketId,
          urgency: details.urgency,
          category: "image-report",
          userName: details.userName || userInfo?.name || "Website Visitor",
          userEmail: userInfo?.email || "N/A",
          unitInfo: details.unitInfo,
          preferredTime: details.preferredTime,
          availability: details.availability,
          summary: `Photo report: ${(message || "Image uploaded").slice(0, 200)}`,
          conversation,
          aiResponse: reply,
          hasImage: true,
          imageDescription: reply,
        });
      } catch {
        // best-effort
      }

      const urgencyNote = details.urgency === "emergency"
        ? "\n🚨 Flagged as **EMERGENCY** — our team will prioritize this."
        : "";

      return NextResponse.json({
        reply: `${reply}\n\n📋 Ticket **${ticketId}** created with your photo. Our team has been notified.${urgencyNote}`,
        ticketId,
        urgency: details.urgency,
      });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Image chat error:", error);
    return NextResponse.json(
      { error: "Couldn't analyze that image. Please try again." },
      { status: 500 }
    );
  }
}
