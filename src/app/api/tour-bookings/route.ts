import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createTourEvent } from "@/lib/google-calendar";
import { sendTourConfirmation, sendStaffNotification } from "@/lib/email";

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

    // Check availability before booking
    const { data: existing, error: checkError } = await supabase
      .from("tour_bookings")
      .select("id")
      .eq("tour_date", body.tour_date)
      .eq("tour_time", body.tour_time)
      .neq("status", "cancelled")
      .is("deleted_at", null);

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 400 });
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: `The ${body.tour_time} slot on ${body.tour_date} is no longer available. Please choose a different time.` },
        { status: 409 }
      );
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

    // Send confirmation email to the visitor (non-blocking)
    const propertyName = body.property_slug
      ? body.property_slug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
      : undefined;

    sendTourConfirmation({
      to: body.email,
      firstName: body.first_name,
      lastName: body.last_name,
      tourDate: body.tour_date,
      tourTime: body.tour_time,
      propertyName,
    }).catch((err) => console.error("Tour confirmation email failed:", err));

    // Notify staff (non-blocking)
    sendStaffNotification({
      type: "tour",
      name: `${body.first_name} ${body.last_name}`,
      email: body.email,
      details: `Date: ${body.tour_date}\nTime: ${body.tour_time}\nPhone: ${body.phone}${propertyName ? `\nProperty: ${propertyName}` : ""}`,
    }).catch((err) => console.error("Staff notification email failed:", err));

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
      .is("deleted_at", null)
      .order("tour_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tour bookings" }, { status: 500 });
  }
}
