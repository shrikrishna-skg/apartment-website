import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

function isTableMissing(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = error.message?.toLowerCase() || "";
  return (
    error.code === "42P01" ||
    error.code === "PGRST204" ||
    msg.includes("does not exist") ||
    msg.includes("schema cache") ||
    msg.includes("could not find")
  );
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const active = searchParams.get("active");

    let query = supabase
      .from("ai_knowledge_articles")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (active === "true") {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist yet, return empty array instead of error
      if (isTableMissing(error)) {
        return NextResponse.json([]);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch knowledge articles" },
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
    const { category, title, content, tags, source, source_url, priority } =
      body;

    if (!category || !title || !content) {
      return NextResponse.json(
        { error: "category, title, and content are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ai_knowledge_articles")
      .insert({
        category,
        title,
        content,
        tags: tags ?? [],
        source: source ?? "manual",
        source_url: source_url ?? null,
        priority: priority ?? 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create knowledge article" },
      { status: 500 }
    );
  }
}
