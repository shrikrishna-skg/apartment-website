import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { clearPromptCache } from "@/lib/ai-knowledge";

const DEFAULT_SETTINGS = {
  id: 1,
  model_name: "llama-3.3-70b-versatile",
  temperature: 0.55,
  max_tokens: 700,
  store_conversations: true,
  website_sync_urls: [],
  active_version_id: null,
  active_version: null,
};

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

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: settings, error: settingsError } = await supabase
      .from("ai_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError || !settings) {
      if (isTableMissing(settingsError) || !settings) {
        return NextResponse.json(DEFAULT_SETTINGS);
      }
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    // Get active version info if set
    let activeVersion = null;
    if (settings.active_version_id) {
      const { data: version } = await supabase
        .from("ai_versions")
        .select("*")
        .eq("id", settings.active_version_id)
        .single();
      activeVersion = version;
    }

    return NextResponse.json({ ...settings, active_version: activeVersion });
  } catch {
    // If anything fails, return defaults so the page still works
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const allowedFields = [
      "model_name",
      "temperature",
      "max_tokens",
      "store_conversations",
      "website_sync_urls",
      "active_version_id",
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("ai_settings")
      .update(updates)
      .not("id", "is", null)
      .select()
      .single();

    if (error) {
      if (isTableMissing(error)) {
        // Table doesn't exist — return the values as if saved (they're just defaults)
        return NextResponse.json({
          ...DEFAULT_SETTINGS,
          ...updates,
          _warning: "AI tables not set up yet. Run ai-knowledge-base-setup.sql in Supabase SQL Editor.",
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    clearPromptCache();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
