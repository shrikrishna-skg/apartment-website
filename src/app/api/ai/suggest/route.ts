import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import Groq from "groq-sdk";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch recent conversations (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: conversations, error: convError } = await supabase
      .from("ai_conversations")
      .select("*")
      .gte("created_at", weekAgo.toISOString())
      .order("created_at", { ascending: false });

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 });
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({
        suggestions: [],
        message: "No recent conversations to analyze",
      });
    }

    // Extract user messages and unanswered questions
    const userMessages: string[] = [];
    const unansweredQuestions: string[] = [];

    for (const conv of conversations) {
      const messages = conv.messages as Array<{
        role: string;
        content: string;
      }> | null;
      if (messages && Array.isArray(messages)) {
        for (const msg of messages) {
          if (msg.role === "user") {
            userMessages.push(msg.content);
          }
        }
      }
      const questions = conv.unanswered_questions as string[] | null;
      if (questions && Array.isArray(questions)) {
        unansweredQuestions.push(...questions);
      }
    }

    // Limit to avoid huge prompts
    const sampleMessages = userMessages.slice(0, 100);
    const sampleUnanswered = unansweredQuestions.slice(0, 50);

    // Use Groq LLM to analyze patterns and suggest knowledge articles
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

    const analysisPrompt = `You are an AI knowledge base analyst for College Place Apartments (student housing near MTSU).

Analyze these recent user messages and unanswered questions from our AI chatbot conversations. Identify patterns and suggest knowledge base articles we should create to improve our AI's responses.

RECENT USER MESSAGES (sample):
${sampleMessages.map((m, i) => `${i + 1}. ${m}`).join("\n")}

UNANSWERED QUESTIONS:
${sampleUnanswered.length > 0 ? sampleUnanswered.map((q, i) => `${i + 1}. ${q}`).join("\n") : "None recorded"}

Based on these patterns, suggest 3-5 knowledge base articles. For each, provide:
- category: one of "property-info", "leasing", "maintenance", "policies", "amenities", "faq", "general"
- title: clear article title
- content: the full knowledge content the AI should know (be specific and helpful)
- priority: 1-10 (10 being most urgent)
- reasoning: why this article is needed

Respond in JSON format as an array:
[{"category": "...", "title": "...", "content": "...", "priority": N, "reasoning": "..."}]

Only respond with the JSON array, no additional text.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: analysisPrompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText =
      completion.choices[0]?.message?.content || "[]";

    // Parse the LLM response
    let suggestions: Array<{
      category: string;
      title: string;
      content: string;
      priority: number;
      reasoning: string;
    }> = [];

    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error("[ai-suggest] Failed to parse LLM response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse AI suggestions" },
        { status: 500 }
      );
    }

    // Insert suggestions into ai_suggested_articles
    const insertedSuggestions: Array<Record<string, unknown>> = [];

    for (const suggestion of suggestions) {
      const { data, error } = await supabase
        .from("ai_suggested_articles")
        .insert({
          category: suggestion.category,
          title: suggestion.title,
          suggested_content: suggestion.content,
          priority: suggestion.priority,
          reasoning: suggestion.reasoning,
          status: "pending",
          source_conversation_count: conversations.length,
        })
        .select()
        .single();

      if (!error && data) {
        insertedSuggestions.push(data);
      }
    }

    return NextResponse.json({
      suggestions: insertedSuggestions,
      analyzed_conversations: conversations.length,
      analyzed_messages: sampleMessages.length,
      unanswered_count: sampleUnanswered.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
