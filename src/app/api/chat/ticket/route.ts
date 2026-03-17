import { NextRequest, NextResponse } from "next/server";
import { sendTicketEmail } from "@/lib/email";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const {
      ticketPreview,
      conversation,
      userInfo,
      hasImage,
      imageDescription,
    } = await req.json();

    if (!ticketPreview) {
      return NextResponse.json({ error: "Ticket preview required" }, { status: 400 });
    }

    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    const userName = userInfo?.name || ticketPreview.userName || "Website Visitor";
    const userEmail = userInfo?.email || "Not provided";
    const urgency = ticketPreview.urgency || "normal";
    const unitInfo = ticketPreview.unitInfo || null;
    const preferredTime = userInfo?.preferredTime || ticketPreview.preferredTime || null;
    const availability = ticketPreview.availability || null;
    const summary = ticketPreview.issue?.slice(0, 300) || "Support request via chat";

    // Save to Supabase
    try {
      await supabase.from("chat_tickets").insert({
        ticket_id: ticketId,
        user_name: userName,
        user_email: userEmail,
        category: hasImage ? "image-report" : "chat-confirmed",
        urgency,
        unit_info: unitInfo,
        preferred_time: preferredTime,
        availability,
        has_image: !!hasImage,
        image_description: imageDescription || null,
        summary,
        conversation: conversation || "",
        ai_response: ticketPreview.imageDescription || "",
        status: "open",
        created_at: now,
      });
    } catch {
      // DB insert is best-effort
    }

    // Send professional email
    try {
      await sendTicketEmail({
        ticketId,
        urgency,
        category: hasImage ? "image-report" : "chat-confirmed",
        userName,
        userEmail,
        unitInfo,
        preferredTime,
        availability,
        summary,
        conversation: conversation || "",
        aiResponse: ticketPreview.imageDescription || "",
        hasImage: !!hasImage,
        imageDescription: imageDescription || null,
      });
    } catch {
      // Email is best-effort
    }

    return NextResponse.json({
      ticketId,
      urgency,
      userName,
      unitInfo,
      preferredTime,
      availability,
      summary,
      createdAt: now,
    });
  } catch (error) {
    console.error("Ticket creation error:", error);
    return NextResponse.json(
      { error: "Could not create ticket. Please try again." },
      { status: 500 }
    );
  }
}
