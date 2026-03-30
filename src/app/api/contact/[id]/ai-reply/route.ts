import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import Groq from "groq-sdk";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
  return _groq;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Fetch inquiry
    const { data: inquiry, error: dbError } = await supabase
      .from("contact_inquiries")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (dbError || !inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const systemPrompt = `You are a professional, friendly leasing office assistant for College Place Apartments in Murfreesboro, TN (near MTSU).

Your job is to draft a helpful email reply to a prospective or current resident's inquiry. Be warm, professional, and concise.

Key info about the property:
- Address: 1023 Old Lascassas Rd, Murfreesboro, TN 37130
- Phone: (615) 200-0620
- Email: office@collegeplace.us
- Office Hours: Monday-Saturday 9am-5pm, Closed Sunday
- Properties: College Place Apartments, College Center Apartments, College Pointe Apartments, University Center Apartments
- Floor plans: Studios ($700/mo), Big Studios ($800/mo), 1 Bedrooms ($900/mo), 2 Bed/2 Bath ($700/room/mo)
- Lease terms: 6 or 12 months
- Near MTSU campus
- Amenities: Furnished options, in-unit washer/dryer, pool, fitness center, study rooms

Rules:
- Write ONLY the reply body text. Do not include subject lines, greetings like "Dear" (the email template adds "Hi [Name]"), or sign-offs.
- Keep it under 150 words.
- Be direct and helpful.
- If the inquiry is about pricing, give specific numbers.
- If about availability, suggest scheduling a tour.
- If about maintenance, acknowledge the issue and confirm the team will look into it.
- Do not make up information you don't have.`;

    const userPrompt = `Inquiry type: ${inquiry.inquiry_type || "general"}
${inquiry.property_slug ? `Property interest: ${inquiry.property_slug}` : ""}
From: ${inquiry.name}

Their message:
${inquiry.message || "(No message provided)"}

Draft a professional reply:`;

    const response = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 400,
    });

    const suggestion = response.choices[0]?.message?.content || "";

    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("AI reply error:", err);
    return NextResponse.json(
      { error: "Failed to generate AI reply" },
      { status: 500 }
    );
  }
}
