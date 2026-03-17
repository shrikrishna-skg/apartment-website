import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ["apartment", "full_name", "email", "description"];
    for (const field of requiredFields) {
      if (!body[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const validCategories = ["plumbing", "electrical", "hvac", "appliance", "pest control", "other"];
    const validUrgencies = ["low", "medium", "high", "emergency"];

    const { data, error } = await supabase
      .from("maintenance_requests")
      .insert({
        apartment: body.apartment.trim(),
        full_name: body.full_name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || null,
        category: validCategories.includes(body.category) ? body.category : null,
        urgency: validUrgencies.includes(body.urgency) ? body.urgency : "medium",
        description: body.description.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit maintenance request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("maintenance_requests")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch maintenance requests" },
      { status: 500 }
    );
  }
}
