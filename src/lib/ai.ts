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
  sessionId?: string
) {
  // Get the dynamic system prompt and AI settings from the knowledge base
  const { prompt, settings } = await getSystemPrompt();

  const response = await getGroq().chat.completions.create({
    model: settings.model_name,
    messages: [{ role: "system", content: prompt }, ...messages],
    temperature: settings.temperature,
    max_tokens: settings.max_tokens,
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

  const imagePrompt = `You are a deeply empathetic AI assistant for College Place Apartments (student housing near MTSU, Murfreesboro TN).

A resident/visitor has sent you a photo. Analyze it carefully and thoughtfully:

1. IDENTIFY specifically what the image shows — be precise and descriptive (e.g., "a water stain spreading across the ceiling near the light fixture" not just "a problem")
2. ASSESS severity if it's a maintenance issue — is it something that needs immediate attention or can wait?
3. CONTEXT — relate it to the apartment setting (bathroom, kitchen, bedroom, exterior, etc.)
4. EMPATHIZE — if it's damage or an issue, acknowledge how concerning/inconvenient it must be
5. ADVISE — give practical short-term advice if applicable (e.g., "place a bucket underneath" for a leak)

User's message with this image: "${userMessage || "What do you think about this?"}"

Be specific, warm, and genuinely helpful. 3-5 sentences.
If this looks like a maintenance issue, ask if they'd like you to create a ticket — don't force it.
If it's a general question or photo, just be helpful.

IMPORTANT: If this is clearly a maintenance issue that needs staff attention, end your response with [SUGGEST_TICKET] on its own line. Only do this for real maintenance/damage issues, not general questions.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
        generationConfig: { temperature: 0.5, maxOutputTokens: 600 },
      }),
    }
  );

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't analyze that image clearly. Could you try sending it again, or describe what you're seeing?";
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
