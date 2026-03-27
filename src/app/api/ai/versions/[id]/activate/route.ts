import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { clearPromptCache } from "@/lib/ai-knowledge";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify the version exists
    const { data: version, error: fetchError } = await supabase
      .from("ai_versions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    // 1. Set current active version to 'archived'
    await supabase
      .from("ai_versions")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("status", "active");

    // 2. Set this version to 'active'
    const { data: activated, error: activateError } = await supabase
      .from("ai_versions")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (activateError) {
      return NextResponse.json(
        { error: activateError.message },
        { status: 500 }
      );
    }

    // 3. Update ai_settings.active_version_id
    await supabase
      .from("ai_settings")
      .update({ active_version_id: id, updated_at: new Date().toISOString() })
      .not("id", "is", null);

    // 4. Clear prompt cache
    clearPromptCache();

    // 5. Return the activated version
    return NextResponse.json(activated);
  } catch {
    return NextResponse.json(
      { error: "Failed to activate version" },
      { status: 500 }
    );
  }
}
