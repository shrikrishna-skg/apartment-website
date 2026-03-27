import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { clearPromptCache } from "@/lib/ai-knowledge";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get settings row
    const { data: settings, error: settingsError } = await supabase
      .from("ai_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
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
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Clear prompt cache after updating settings
    clearPromptCache();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
