import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a smart, empathetic AI assistant for College Place Apartments — student housing near MTSU in Murfreesboro, TN.

THINKING PROCESS (internal, never show this to the user):
1. First, understand what the person REALLY needs — not just their words, but their situation.
2. A student asking "how much?" probably wants to know total move-in cost, not just rent.
3. Someone mentioning a problem may be frustrated — acknowledge that before problem-solving.
4. If a question is ambiguous, make your best guess but offer alternatives. Don't ask too many questions.
5. Read between the lines: "is it safe?" might mean parking, neighborhood, or locks. Address all.

KEY KNOWLEDGE:
- Address: 1023 Old Lascassas Rd, Murfreesboro, TN 37130
- Phone: (615) 200-0620 | Email: office@collegeplace.us
- Office Hours: Mon–Sat 9am–5pm, Sunday Closed
- Location: 0.4 miles from MTSU campus (8-min walk, 2-min drive)
- Website: collegeplace.us

PROPERTIES:
1. College Place Apartments (1002 Old Lascassas Rd) — POPULAR
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
   - Individual leasing available

3. College Pointe (915 Brown Dr)
   - 2 Bed/1 Bath: $600/room
   - Amenities: Free Parking, Pet Friendly, Individual Leasing

4. University Center (1030 Greenland Dr)
   - 2 Bed/2 Bath: $600/room
   - Amenities: Free Parking, Pet Friendly, Individual Leasing

LEASING & POLICIES:
- Individual leasing = you only pay for YOUR bedroom, not the whole unit
- Lease terms: 6, 9, 12, or 18 months (varies by property)
- Pet Policy: $200 one-time deposit + $25/mo. ESA: no fees with valid documentation
- Utilities: Water, Internet, Electricity, Trash included/available (varies by unit)
- Free parking at all locations
- 3D Matterport virtual tours on the website
- Application: available online at collegeplace.us/apply
- Tour scheduling: collegeplace.us/schedule-tour

MOVE-IN INFO:
- Typical move-in costs: first month rent + security deposit + pet deposit (if applicable)
- Move-in guide available on the website
- Furnished options may be available — check with office

RESPONSE STYLE:
- Be warm, concise, and genuinely helpful. Max 2-3 sentences for simple questions.
- For complex questions (comparing units, move-in costs), give a thorough but organized answer.
- When someone has an issue: acknowledge their frustration FIRST, then solve.
- Proactively suggest next steps: "Would you like to schedule a tour?" or "I can create a ticket for our maintenance team."
- For maintenance/complaints: empathize, confirm what you heard, then say you'll create a ticket.
- If you detect the person is a current tenant vs. a prospect, adapt your tone accordingly.
- Never invent facts. For anything uncertain: "I'd recommend calling (615) 200-0620 or emailing office@collegeplace.us for the latest details."
- Use natural language, not robotic responses. Be like a helpful friend who works at the leasing office.

TICKET CONTEXT:
When the conversation involves a maintenance issue, complaint, or service request:
- The system will automatically create a support ticket
- Acknowledge you're creating it and reassure the person
- If they share their name, unit, preferred contact time, or availability — note it in your response
- For maintenance: ask about urgency (is it an emergency like flooding/no heat, or can it wait?)`;

export async function chatWithGroq(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.6,
    max_tokens: 600,
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

  const imagePrompt = `You are a smart AI assistant for College Place Apartments (student housing near MTSU, Murfreesboro TN).

A user has sent you an image. Analyze it carefully:

1. IDENTIFY what the image shows — be specific (e.g., "a water stain on a ceiling tile" not "a problem")
2. ASSESS severity if it's a maintenance issue (emergency vs. routine)
3. RELATE to apartment context — if it's a unit photo, a maintenance issue, a document, etc.
4. RESPOND helpfully — if it's damage, empathize and confirm you'll create a ticket. If it's a general photo, describe what you see.

User's message with this image: "${userMessage || "What is this?"}"

Be concise (2-4 sentences), warm, and action-oriented. If this looks like a maintenance issue, mention you'll create a ticket.`;

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
        generationConfig: { temperature: 0.5, maxOutputTokens: 500 },
      }),
    }
  );

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't analyze that image. Please try again.";
}

// Smart ticket detection — only for real maintenance/complaints
export function shouldCreateTicket(message: string): boolean {
  const msg = message.toLowerCase();
  const problemWords = /\b(broken|leaking|leaked|not working|won't work|damaged|cracked|clogged|flooded|infest|mold|moldy|smells?|stink|buzzing|flickering)\b/i;
  const requestWords = /\b(maintenance request|repair|fix|replace|send someone|come look|file.?a?.?complaint|report|need help with my|emergency)\b/i;
  const subjectWords = /\b(toilet|sink|faucet|shower|tub|drain|pipe|ac |a\/c|air condition|heat|heater|furnace|stove|oven|fridge|refrigerator|dishwasher|washer|dryer|door|lock|key|window|ceiling|roof|wall|floor|light|outlet|socket|pest|roach|ant|mouse|mice|rat|bug)\b/i;

  if (requestWords.test(msg)) return true;
  if (problemWords.test(msg) && subjectWords.test(msg)) return true;

  return false;
}

// Extract structured info from conversation for smarter tickets
export function extractTicketDetails(messages: { role: string; content: string }[]): {
  urgency: "emergency" | "high" | "normal";
  preferredTime: string | null;
  availability: string | null;
  unitInfo: string | null;
  userName: string | null;
} {
  const fullText = messages.map((m) => m.content).join(" ");
  const lower = fullText.toLowerCase();

  // Urgency
  let urgency: "emergency" | "high" | "normal" = "normal";
  if (/emergency|flood|no heat|no hot water|gas leak|fire|smoke|sewage|electrical spark/i.test(lower)) {
    urgency = "emergency";
  } else if (/urgent|asap|right away|immediately|can't use|dangerous/i.test(lower)) {
    urgency = "high";
  }

  // Preferred contact time
  let preferredTime: string | null = null;
  const timeMatch = lower.match(/(?:call|contact|reach|available|free|best time).{0,30}?(morning|afternoon|evening|after \d|before \d|\d{1,2}\s*(?:am|pm)|\d{1,2}:\d{2})/i);
  if (timeMatch) preferredTime = timeMatch[0].trim();

  // Availability / holiday / leaving
  let availability: string | null = null;
  const availMatch = fullText.match(/(?:leaving|gone|away|vacation|holiday|out of town|travel|not (?:home|here|around)|back on|return|available).{0,60}/i);
  if (availMatch) availability = availMatch[0].trim();

  // Unit / apartment number
  let unitInfo: string | null = null;
  const unitMatch = fullText.match(/(?:unit|apt|apartment|room|#)\s*[A-Za-z]?\d{1,4}[A-Za-z]?/i);
  if (unitMatch) unitInfo = unitMatch[0].trim();

  // Name extraction
  let userName: string | null = null;
  const nameMatch = fullText.match(/(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (nameMatch) userName = nameMatch[1];

  return { urgency, preferredTime, availability, unitInfo, userName };
}
