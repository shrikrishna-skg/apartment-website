import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini, extractTicketDetails } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType, message } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    // Ensure we have clean base64 (strip data URL prefix if present)
    let cleanBase64 = image;
    if (cleanBase64.startsWith("data:")) {
      cleanBase64 = cleanBase64.split(",")[1] || cleanBase64;
    }
    const effectiveMime = mimeType || "image/jpeg";

    console.log(`[Image API] Received image: mime=${effectiveMime}, base64Length=${cleanBase64.length}`);

    const reply = await analyzeImageWithGemini(
      cleanBase64,
      effectiveMime,
      message || ""
    );

    // Check if AI suggests creating a ticket
    const suggestTicket = reply.includes("[SUGGEST_TICKET]");
    const cleanReply = reply.replace(/\n?\[SUGGEST_TICKET\]\n?/g, "").trim();

    if (suggestTicket) {
      const fakeMessages = [
        { role: "user", content: message || "Photo uploaded for review" },
        { role: "assistant", content: cleanReply },
      ];
      const details = extractTicketDetails(fakeMessages);

      return NextResponse.json({
        reply: cleanReply,
        suggestTicket: true,
        hasImage: true,
        imageDescription: cleanReply,
        ticketPreview: {
          issue: message || "Photo report — see image analysis",
          urgency: details.urgency,
          unitInfo: details.unitInfo,
          preferredTime: details.preferredTime,
          availability: details.availability,
          userName: details.userName,
          imageDescription: cleanReply.slice(0, 300),
        },
      });
    }

    return NextResponse.json({ reply: cleanReply });
  } catch (error) {
    console.error("Image chat error:", error);
    return NextResponse.json(
      { error: "Couldn't analyze that image. Please try again." },
      { status: 500 }
    );
  }
}
