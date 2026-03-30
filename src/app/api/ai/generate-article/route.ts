import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Groq from "groq-sdk";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
  return _groq;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { topic } = await request.json();

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const systemPrompt = `You are a knowledge base article writer for College Place Apartments, a student housing community near MTSU (Middle Tennessee State University) in Murfreesboro, TN.

Property details for context:
- College Place Apartments: 1002 Old Lascassas Rd. Studios $700/mo, Big Studios $800/mo, 1BR $900/mo, 2BR/2BA $700/room/mo
- College Center Apartments: 1023 Old Lascassas Rd. 2BR/2BA $550/room, 4BR/4BA $500/room (most affordable)
- College Pointe: 915 Brown Dr. 2BR/1BA $600/room
- University Center: 1030 Greenland Dr. 2BR/2BA $600/room
- Office: (615) 200-0620, office@collegeplace.us, Mon-Sat 9am-5pm
- Utilities: $100/person/month (water, internet, trash)
- Pets: $200 deposit + $25/month rent, ESA no fees
- Lease terms: 6, 9, 12, or 18 months
- Individual leasing available

Write a knowledge base article that the AI chatbot can use to answer tenant/prospect questions.

Return a JSON object with these exact fields:
{
  "title": "Short descriptive title",
  "content": "Detailed article content with all relevant facts. Be specific with numbers, dates, and details. 2-4 paragraphs.",
  "category": "One of: property, pricing, policy, faq, location, amenity, process, custom",
  "tags": ["tag1", "tag2", "tag3"],
  "priority": 5
}

Rules:
- Be factual and specific — include real numbers, addresses, and details
- Write content that helps the chatbot give accurate answers
- Priority: 1-3 for minor info, 4-6 for standard, 7-9 for important, 10 for critical
- Return ONLY valid JSON, no markdown or explanation`;

    const response = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Write a knowledge base article about: ${topic}` },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const raw = response.choices[0]?.message?.content || "";

    // Parse JSON from the response (handle potential markdown wrapping)
    let article;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      article = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      article = null;
    }

    if (!article || !article.title || !article.content) {
      return NextResponse.json(
        { error: "AI failed to generate a valid article. Try a more specific topic." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      title: article.title,
      content: article.content,
      category: article.category || "faq",
      tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
      priority: article.priority || 5,
    });
  } catch (err) {
    console.error("AI article generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate article" },
      { status: 500 }
    );
  }
}
