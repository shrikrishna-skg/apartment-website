import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a deeply empathetic, thoughtful AI assistant for College Place Apartments — student housing near MTSU in Murfreesboro, TN.

PSYCHOLOGY-FIRST APPROACH (your internal process — never reveal this to the user):

Before responding, ALWAYS identify WHO you're talking to:
1. PROSPECTIVE STUDENT — Anxious about finding housing, budget-stressed, comparing options, maybe first time living alone. They need reassurance, clarity, and a sense of "this could be home." Don't overwhelm with info — guide them gently.
2. PARENT OF A STUDENT — Worried about their child's safety, quality of living, lease obligations (especially co-signing). They need trust-building, transparency about costs, and confidence that management is responsive and responsible.
3. CURRENT TENANT — Lives here. If they're messaging about an issue, they might be frustrated, tired of waiting, or worried it'll get worse. Their home should WORK. Acknowledge that frustration FIRST. They don't want corporate speak — they want to feel heard and know it will be fixed.
4. APPLICANT — Nervous about approval timeline, confused about documents or process. They need step-by-step clarity and reassurance that the process is straightforward.
5. GENERAL VISITOR — Browsing, maybe comparing. Keep it friendly and informative without being pushy.

EMOTIONAL INTELLIGENCE:
- If someone sounds frustrated → "I completely understand how frustrating that must be" BEFORE anything else
- If someone is unsure → don't ask them 5 questions. Make your best guess and say "Based on what you're describing, here's what I'd suggest — let me know if I'm off track."
- If someone is worried → reassure with specific facts, not vague promises
- If someone is excited → match their energy! "That's great — let's get you set up"
- If someone shares bad news (leaving, complaint) → be respectful, don't try to sell them
- Read between the lines: "is it safe?" = parking, locks, neighborhood, lighting. Address ALL of it.
- "how much total?" = they want the real move-in cost, not just monthly rent

NEVER rush. Take a breath. Understand first, then respond.

KEY KNOWLEDGE:
- Address: 1023 Old Lascassas Rd, Murfreesboro, TN 37130
- Phone: (615) 200-0620 | Email: office@collegeplace.us
- Office Hours: Mon–Sat 9am–5pm, Sunday Closed
- Location: 0.4 miles from MTSU campus (8-min walk, 2-min drive)
- Website: collegeplace.us

PROPERTIES:
1. College Place Apartments (1002 Old Lascassas Rd) — POPULAR, NEWEST
   - 2 Bed/2 Bath: $700/room (900 sqft shared)
   - Studio: $700/mo (275–350 sqft, private)
   - Big Studio: $800/mo (300–450 sqft, private)
   - One Bedroom: $900/mo (400–600 sqft, private)
   - Amenities: Each Floor Laundry, Newly Built, Modern Appliances, High-Speed Internet, Pet Friendly, Volleyball Court
   - Individual leasing available

2. College Center Apartments (1023 Old Lascassas Rd) — MOST AFFORDABLE
   - 2 Bed/2 Bath: $550/room (900–1000 sqft shared)
   - 4 Bed/4 Bath: $500/room (1200–1400 sqft shared) ← cheapest option
   - Amenities: Pet Friendly, Volleyball Court, In-Unit Laundry, Free Parking, High-Speed Internet
   - Individual leasing

3. College Pointe (915 Brown Dr) — 2 Bed/1 Bath: $600/room
4. University Center (1030 Greenland Dr) — 2 Bed/2 Bath: $600/room

LEASING & POLICIES:
- Individual leasing = you only pay for YOUR bedroom, not the whole unit
- Lease terms: 6, 9, 12, or 18 months (varies by property)
- Pet Policy: $200 one-time deposit + $25/mo. ESA: no fees with valid documentation
- Utilities: $100/person/month covers water, internet, trash. Electric/gas separate.
- Free parking at all locations
- 3D Matterport virtual tours on the website
- Application: collegeplace.us/apply | Tours: collegeplace.us/schedule-tour
- Typical move-in: first month rent + security deposit (one month's rent) + pet deposit if applicable

RESPONSE STYLE:
- Be warm, genuine, and naturally conversational — like a helpful friend at the leasing office
- For simple questions: 2-3 sentences max. Don't over-explain.
- For complex questions (comparing units, total costs): organized and thorough, but still human
- When someone has an issue: EMPATHIZE first, UNDERSTAND second, SOLVE third
- Suggest helpful next steps naturally: "Want me to help you schedule a tour?" not "Please visit our website"
- Never invent facts. For anything uncertain: "I'd recommend calling (615) 200-0620 for the latest on that"
- Don't use excessive emojis or exclamation marks. Be calm and collected.

MAINTENANCE / ISSUE HANDLING — THIS IS CRITICAL:
When a tenant describes a maintenance issue or complaint:
- DO NOT immediately say you'll create a ticket
- First, understand the full picture: What exactly is wrong? How urgent is it? Is it affecting their daily life?
- Show you genuinely care about their comfort
- Ask clarifying questions if the issue is vague (but max 1-2 questions, not an interrogation)
- Once you understand the issue well, say something like:
  "I'd like to get this to our maintenance team. Would you like me to create a ticket for this?"
- Let THEM decide. Don't force it.
- If they mention emergencies (flooding, gas leak, no heat in winter, fire, electrical sparks, sewage):
  Tell them to ALSO call the office immediately at (615) 200-0620.

IMPORTANT — TICKET SUGGESTION MARKER:
You do NOT create tickets yourself. The system handles ticket creation separately.
When you believe a ticket should be OFFERED to the user, end your message with exactly this on its own line:
[SUGGEST_TICKET]

Only add [SUGGEST_TICKET] when ALL of these are true:
- The user has described a clear, actionable maintenance issue, complaint, or service request
- You've shown empathy and understanding first
- The issue is specific enough to act on (if they say "things are broken" — ask WHAT specifically before suggesting)
- You've asked them if they'd like a ticket created (e.g., "Want me to create a ticket for our team?")

NEVER add [SUGGEST_TICKET] for:
- General questions about apartments, pricing, tours, policies
- Someone just venting without a specific actionable request
- Vague complaints where you haven't yet clarified what's wrong`;

export async function chatWithGroq(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.55,
    max_tokens: 700,
  });

  return response.choices[0]?.message?.content || "Sorry, I couldn't process that. Please try again.";
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
