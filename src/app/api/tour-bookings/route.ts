import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createTourEvent } from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Only these are truly required
    const requiredFields = ["first_name", "last_name", "email", "phone", "tour_date", "tour_time"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Try to create Google Calendar event (graceful fallback if not configured)
    let googleEventId: string | null = null;
    try {
      googleEventId = await createTourEvent({
        date: body.tour_date,
        time: body.tour_time,
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        phone: body.phone,
        propertySlug: body.property_slug || undefined,
        floorPlan: body.floor_plan || undefined,
      });
    } catch (err) {
      console.error("Google Calendar event creation failed:", err);
    }

    const { data, error } = await supabase
      .from("tour_bookings")
      .insert({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        property_slug: body.property_slug || null,
        floor_plan: body.floor_plan || null,
        tour_date: body.tour_date,
        tour_time: body.tour_time,
        notes: body.notes || null,
        google_event_id: googleEventId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to book tour" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tour_bookings")
      .select("*")
      .order("tour_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tour bookings" }, { status: 500 });
  }
}
