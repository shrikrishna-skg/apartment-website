import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all conversations
    const { data: conversations, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allConversations = conversations ?? [];

    // Time boundaries
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    // total_conversations
    const total_conversations = allConversations.length;

    // conversations_this_week
    const conversations_this_week = allConversations.filter(
      (c) => new Date(c.created_at) >= weekStart
    ).length;

    // conversations_today
    const conversations_today = allConversations.filter(
      (c) => new Date(c.created_at) >= todayStart
    ).length;

    // avg_message_count
    const totalMessages = allConversations.reduce(
      (sum, c) => sum + (c.message_count ?? 0),
      0
    );
    const avg_message_count =
      total_conversations > 0
        ? Math.round((totalMessages / total_conversations) * 10) / 10
        : 0;

    // ticket_conversion_rate
    const ticketConversations = allConversations.filter(
      (c) => c.created_ticket
    ).length;
    const ticket_conversion_rate =
      total_conversations > 0
        ? Math.round((ticketConversations / total_conversations) * 1000) / 10
        : 0;

    // top_topics - aggregate topics arrays, count occurrences, top 10
    const topicCounts: Record<string, number> = {};
    for (const c of allConversations) {
      const topics = c.topics as string[] | null;
      if (topics && Array.isArray(topics)) {
        for (const topic of topics) {
          topicCounts[topic] = (topicCounts[topic] ?? 0) + 1;
        }
      }
    }
    const top_topics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // sentiment_distribution - count by sentiment value
    const sentimentCounts: Record<string, number> = {};
    for (const c of allConversations) {
      const sentiment = (c.sentiment as string) ?? "unknown";
      sentimentCounts[sentiment] = (sentimentCounts[sentiment] ?? 0) + 1;
    }
    const sentiment_distribution = sentimentCounts;

    // recent_unanswered - aggregate unanswered_questions, last 50
    const unansweredQuestions: Array<{
      question: string;
      session_id: string;
      created_at: string;
    }> = [];
    for (const c of allConversations) {
      const questions = c.unanswered_questions as string[] | null;
      if (questions && Array.isArray(questions)) {
        for (const q of questions) {
          unansweredQuestions.push({
            question: q,
            session_id: c.session_id,
            created_at: c.created_at,
          });
        }
      }
    }
    const recent_unanswered = unansweredQuestions.slice(0, 50);

    return NextResponse.json({
      total_conversations,
      conversations_this_week,
      conversations_today,
      avg_message_count,
      ticket_conversion_rate,
      top_topics,
      sentiment_distribution,
      recent_unanswered,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
