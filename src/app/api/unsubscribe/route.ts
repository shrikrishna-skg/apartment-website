import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Unsubscribe a subscriber by their one-time token. Sets subscribed=false and
 * records unsubscribed_at — every send query filters these out, so emails stop.
 * POST (not GET) so email-client link prefetching can't unsubscribe by accident.
 */
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Missing unsubscribe token" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("email_subscribers")
      .update({ subscribed: false, unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .select("email")
      .maybeSingle();

    if (error) {
      console.error("[unsubscribe] update failed:", error.message);
      return NextResponse.json({ error: "Could not process unsubscribe" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Invalid or expired unsubscribe link" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, email: data.email });
  } catch {
    return NextResponse.json({ error: "Could not process unsubscribe" }, { status: 500 });
  }
}
