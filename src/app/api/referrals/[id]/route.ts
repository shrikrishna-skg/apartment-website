import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const VALID_STATUSES = ["submitted", "contacted", "toured", "leased", "expired", "rejected"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Support soft delete
    if (body.deleted_at !== undefined) {
      const { data, error } = await supabase
        .from("referrals")
        .update({ deleted_at: body.deleted_at })
        .eq("id", id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (!data) return NextResponse.json({ error: "Referral not found" }, { status: 404 });
      return NextResponse.json(data);
    }

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("referrals")
      .update({ status: body.status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Referral not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update referral status" },
      { status: 500 }
    );
  }
}
