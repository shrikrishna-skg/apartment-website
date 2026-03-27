import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("ai_versions")
      .select("*")
      .order("version_number", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { label, description } = body;

    if (!label) {
      return NextResponse.json(
        { error: "label is required" },
        { status: 400 }
      );
    }

    // 1. Query all active knowledge articles
    const { data: articles, error: articlesError } = await supabase
      .from("ai_knowledge_articles")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false });

    if (articlesError) {
      return NextResponse.json(
        { error: articlesError.message },
        { status: 500 }
      );
    }

    // 2. Calculate next version number
    const { data: latestVersion } = await supabase
      .from("ai_versions")
      .select("version_number")
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = latestVersion
      ? latestVersion.version_number + 1
      : 1;

    // 3. Build snapshot
    const articleList = articles ?? [];
    const snapshot = {
      articles: articleList,
      article_ids: articleList.map(
        (a: { id: string }) => a.id
      ),
    };

    // 4. Calculate total token estimate (sum of content lengths / 4)
    const totalTokenEstimate = Math.ceil(
      articleList.reduce(
        (sum: number, a: { content: string }) => sum + (a.content?.length ?? 0),
        0
      ) / 4
    );

    // 5. Insert with status='draft'
    const { data, error } = await supabase
      .from("ai_versions")
      .insert({
        version_number: nextVersionNumber,
        label,
        description: description ?? null,
        snapshot,
        article_count: articleList.length,
        total_token_estimate: totalTokenEstimate,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 }
    );
  }
}
