import Groq from "groq-sdk";
import { getSystemPrompt, storeConversation } from "./ai-knowledge";

// Lazy-init to avoid build-time crash when GROQ_API_KEY isn't set
let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
  return _groq;
}

export async function chatWithGroq(
  messages: { role: "user" | "assistant"; content: string }[],
  sessionId?: string,
  systemPromptOverride?: string
) {
  // Get the dynamic system prompt and AI settings from the knowledge base
  const { prompt, settings } = await getSystemPrompt();
  const finalPrompt = systemPromptOverride || prompt;

  const response = await getGroq().chat.completions.create({
    model: settings.model_name,
    messages: [{ role: "system", content: finalPrompt }, ...messages],
    temperature: systemPromptOverride ? 0.4 : settings.temperature,
    max_tokens: systemPromptOverride ? 500 : settings.max_tokens,
  });

  const reply =
    response.choices[0]?.message?.content ||
    "Sorry, I couldn't process that. Please try again.";

  // Fire-and-forget: store conversation if enabled
  if (sessionId && settings.store_conversations) {
    try {
      const allMessages = [
        ...messages,
        { role: "assistant" as const, content: reply },
      ];
      storeConversation(sessionId, allMessages).catch((err) =>
        console.error("[ai] Failed to store conversation:", err)
      );
    } catch {
      // Non-blocking — do not let storage errors affect the reply
    }
  }

  return reply;
}

export async function analyzeImageWithGemini(
  base64Image: string,
  mimeType: string,
  userMessage: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key not configured");

  const imagePrompt = `You are a highly trained maintenance expert and empathetic assistant for College Place Apartments (student housing near MTSU, Murfreesboro TN).

A resident has sent you a photo of an issue in their apartment. Analyze it with the detail and care of an experienced maintenance professional doing an in-person inspection.

ANALYSIS FRAMEWORK — go through each step:

1. WHAT I SEE (be extremely specific):
   - Identify every visible detail: the object, its condition, location in the room, surrounding context
   - Example: NOT "a bug" → "a large American cockroach (approximately 1.5 inches) near a bathroom sink drain, suggesting possible entry from plumbing"
   - Example: NOT "water damage" → "a brownish-yellow water stain approximately 8 inches in diameter on the ceiling near the bathroom vent, with slight bubbling of the paint indicating moisture buildup behind the drywall"

2. SEVERITY ASSESSMENT:
   - Is this a health/safety risk? (mold, pests, electrical, structural)
   - How urgent? Emergency (immediate danger), High (same-day), Medium (this week), Low (routine)
   - Could this get worse if not addressed quickly?

3. LIKELY CAUSE:
   - Based on what you see, what's probably causing this?
   - Example: "Cockroach near drain likely indicates entry through plumbing gaps or sewer line — if you're seeing them during the day, there may be a larger infestation"
   - Example: "Ceiling stain near vent suggests a leak from the unit above or condensation from HVAC"

4. WHAT THE RESIDENT SHOULD DO RIGHT NOW:
   - Practical, actionable short-term advice they can do immediately
   - Example: "Keep the area dry, avoid using that outlet, place a bucket underneath, seal food in airtight containers"

5. WHAT OUR TEAM WILL DO:
   - Brief note on what maintenance will likely need to do
   - Example: "Our pest control team will treat the unit and check for entry points"

User's additional context: "${userMessage || "Photo of maintenance issue"}"

TONE: Warm, caring, knowledgeable — like a helpful neighbor who happens to be a maintenance expert. Don't be clinical or robotic. Show you genuinely care about their living situation.

RESPONSE FORMAT: Write 4-6 sentences as a flowing, natural response (not numbered lists). Weave all the analysis naturally into your reply.

DO NOT say "I can see an image of..." — speak as if you're looking at it in person: "Oh, that's definitely a cockroach..." or "I can see water damage forming on your ceiling..."`;


  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: imagePrompt },
              { inline_data: { mime_type: mimeType, data: base64Image } },
            ],
          },
        ],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
    }
  );

  const data = await response.json();

  if (data.error) {
    console.error("[Gemini] API error:", data.error.message);
    return `I had trouble analyzing that image (${data.error.message}). Could you describe what you're seeing?`;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error("[Gemini] No text in response:", JSON.stringify(data).slice(0, 500));
    return "I couldn't analyze that image clearly. Could you try sending it again, or describe what you're seeing?";
  }

  return text;
}

// Extract structured info from conversation for ticket details
export function extractTicketDetails(messages: { role: string; content: string }[]): {
  urgency: "emergency" | "high" | "normal";
  preferredTime: string | null;
  availability: string | null;
  unitInfo: string | null;
  userName: string | null;
  issue: string;
} {
  const fullText = messages.map((m) => m.content).join(" ");
  const lower = fullText.toLowerCase();

  // Urgency detection
  let urgency: "emergency" | "high" | "normal" = "normal";
  if (/emergency|flood|no heat|no hot water|gas leak|fire|smoke|sewage|electrical spark|carbon monoxide/i.test(lower)) {
    urgency = "emergency";
  } else if (/urgent|asap|right away|immediately|can't use|dangerous|water everywhere|raw sewage/i.test(lower)) {
    urgency = "high";
  }

  // Preferred contact time
  let preferredTime: string | null = null;
  const timeMatch = lower.match(/(?:call|contact|reach|available|free|best time).{0,30}?(morning|afternoon|evening|after \d|before \d|\d{1,2}\s*(?:am|pm)|\d{1,2}:\d{2})/i);
  if (timeMatch) preferredTime = timeMatch[0].trim();

  // Availability / holiday / leaving
  let availability: string | null = null;
  const availMatch = fullText.match(/(?:leaving|gone|away|vacation|holiday|out of town|travel|not (?:home|here|around)|back on|return|available|spring break|winter break|summer).{0,80}/i);
  if (availMatch) availability = availMatch[0].trim();

  // Unit / apartment number
  let unitInfo: string | null = null;
  const unitMatch = fullText.match(/(?:unit|apt|apartment|room|#)\s*[A-Za-z]?\d{1,4}[A-Za-z]?/i);
  if (unitMatch) unitInfo = unitMatch[0].trim();

  // Name extraction
  let userName: string | null = null;
  const nameMatch = fullText.match(/(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (nameMatch) userName = nameMatch[1];

  // Extract the core issue from user messages only
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content);
  const issue = userMessages.slice(-3).join(" | ").slice(0, 300);

  return { urgency, preferredTime, availability, unitInfo, userName, issue };
}
