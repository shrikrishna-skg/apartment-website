import { NextRequest, NextResponse } from "next/server";
import { chatWithGroq, extractTicketDetails } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const reply = await chatWithGroq(messages);

    // Check if AI suggests creating a ticket (contains [SUGGEST_TICKET] marker)
    const suggestTicket = reply.includes("[SUGGEST_TICKET]");
    const cleanReply = reply.replace(/\n?\[SUGGEST_TICKET\]\n?/g, "").trim();

    if (suggestTicket) {
      // Extract ticket details from conversation for the preview card
      const details = extractTicketDetails(messages);
      return NextResponse.json({
        reply: cleanReply,
        suggestTicket: true,
        ticketPreview: {
          issue: details.issue,
          urgency: details.urgency,
          unitInfo: details.unitInfo,
          preferredTime: details.preferredTime,
          availability: details.availability,
          userName: details.userName,
        },
      });
    }

    return NextResponse.json({ reply: cleanReply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
