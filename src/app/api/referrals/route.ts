import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = [
      "referrer_name",
      "referrer_email",
      "referrer_phone",
      "referrer_unit",
      "friend_name",
    ];
    for (const field of requiredFields) {
      if (!body[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!body.consent_share || !body.consent_contact) {
      return NextResponse.json(
        { error: "Both consent checkboxes must be agreed to" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("referrals")
      .insert({
        referrer_name: body.referrer_name.trim(),
        referrer_email: body.referrer_email.trim(),
        referrer_phone: body.referrer_phone.trim(),
        referrer_unit: body.referrer_unit.trim(),
        preferred_contact: body.preferred_contact || "email",
        relationship: body.relationship || "friend",
        friend_name: body.friend_name.trim(),
        friend_email: body.friend_email?.trim() || null,
        friend_phone: body.friend_phone?.trim() || null,
        move_in_timeline: body.move_in_timeline || null,
        budget_range: body.budget_range || null,
        occupants: body.occupants || null,
        notes: body.notes?.trim() || null,
        consent_share: body.consent_share,
        consent_contact: body.consent_contact,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit referral" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}
