import { NextRequest, NextResponse } from "next/server";
import { chatWithGroq, extractTicketDetails } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId, systemPromptOverride } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const reply = await chatWithGroq(messages, sessionId, systemPromptOverride);

    // Check for tour booking marker
    const tourMatch = reply.match(/\[BOOK_TOUR\]([\s\S]*?)\[\/BOOK_TOUR\]/);
    if (tourMatch) {
      const details = tourMatch[1];
      const firstName = details.match(/first_name:\s*(.+)/i)?.[1]?.trim() || "";
      const lastName = details.match(/last_name:\s*(.+)/i)?.[1]?.trim() || "";
      const email = details.match(/email:\s*(.+)/i)?.[1]?.trim() || "";
      const phone = details.match(/phone:\s*(.+)/i)?.[1]?.trim() || "";
      const tourDate = details.match(/tour_date:\s*(.+)/i)?.[1]?.trim() || "";
      const tourTime = details.match(/tour_time:\s*(.+)/i)?.[1]?.trim() || "";

      let cleanReply = reply.replace(/\[BOOK_TOUR\][\s\S]*?\[\/BOOK_TOUR\]/, "").trim();

      // Book the tour via Supabase
      if (firstName && email && tourDate) {
        try {
          const { error } = await supabase.from("tour_bookings").insert({
            first_name: firstName,
            last_name: lastName,
            email,
            phone: phone || null,
            tour_date: tourDate,
            tour_time: tourTime || "10:00 AM",
            source: "chat-assistant",
          });

          if (error) {
            console.error("[Tour Booking] DB error:", error.message);
            cleanReply += "\n\n(I had a small issue booking automatically. Please visit collegeplace.us/schedule-tour or call (615) 200-0620 to confirm your tour.)";
          } else {
            cleanReply += `\n\n✅ **Tour booked!** We've scheduled your visit for ${tourDate} at ${tourTime}. You'll receive a confirmation at ${email}. See you then!`;

            // Send email notification
            try {
              await fetch(new URL("/api/tour-bookings", req.url).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  first_name: firstName,
                  last_name: lastName,
                  email,
                  phone: phone || "",
                  tour_date: tourDate,
                  tour_time: tourTime || "10:00 AM",
                }),
              });
            } catch {
              // Email is best-effort
            }
          }
        } catch {
          cleanReply += "\n\n(Please visit collegeplace.us/schedule-tour to complete your booking.)";
        }
      }

      return NextResponse.json({ reply: cleanReply });
    }

    // Check if AI suggests creating a ticket (contains [SUGGEST_TICKET] marker)
    const suggestTicket = reply.includes("[SUGGEST_TICKET]");
    const cleanReply = reply.replace(/\n?\[SUGGEST_TICKET\]\n?/g, "").trim();

    if (suggestTicket) {
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
