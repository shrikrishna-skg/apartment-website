import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { createTourEvent } from "@/lib/google-calendar";
import { sendTourConfirmation, sendStaffNotification } from "@/lib/email";
import { getSession } from "@/lib/auth";

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

    const isVirtual = !!body.is_virtual;
    const extraGuests: string[] = Array.isArray(body.extra_guests)
      ? body.extra_guests.filter((e: unknown) => typeof e === "string" && e.trim())
      : [];

    // Persistent office Meet link — set via OFFICE_MEET_LINK env var, with per-booking override.
    const officeMeet = process.env.OFFICE_MEET_LINK || "";
    let meetLink: string | null = isVirtual ? (body.meet_link?.trim() || officeMeet || null) : null;

    // Try to create Google Calendar event (graceful fallback if not configured).
    // Calendar event is independent of the Meet link — if API is down, we still save the booking.
    let googleEventId: string | null = null;
    try {
      const ev = await createTourEvent({
        date: body.tour_date,
        time: body.tour_time,
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        phone: body.phone,
        propertySlug: body.property_slug || undefined,
        floorPlan: body.floor_plan || undefined,
        title: body.title || undefined,
        location: body.location || undefined,
        notes: body.notes || undefined,
        isVirtual: false, // don't create a new Meet room — we use the persistent office link
        extraGuests,
      });
      googleEventId = ev.eventId;
      // Prefer the persistent office link; fall back to whatever Calendar created if we ever enable createRequest.
      if (isVirtual && !meetLink && ev.meetLink) meetLink = ev.meetLink;
    } catch (err) {
      console.error("Google Calendar event creation failed:", err);
    }

    // Generate one-time tokenized join URL for virtual tours
    // Expires 15 min after tour end (tour is 10 min, so ~25 min after start)
    const joinToken = isVirtual ? crypto.randomBytes(24).toString("base64url") : null;
    let joinTokenExpiresAt: string | null = null;
    if (isVirtual) {
      const [h, m] = parseTimeForExpiry(body.tour_time);
      const expiry = new Date(`${body.tour_date}T00:00:00`);
      expiry.setHours(h, m + 25, 0, 0);
      joinTokenExpiresAt = expiry.toISOString();
    }

    const fullInsert: Record<string, unknown> = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      property_slug: body.property_slug || null,
      floor_plan: body.floor_plan || null,
      tour_date: body.tour_date,
      tour_time: body.tour_time,
      notes: body.notes || null,
      title: body.title || null,
      location: body.location || null,
      is_virtual: isVirtual,
      meet_link: meetLink,
      extra_guests: extraGuests,
      join_token: joinToken,
      join_token_expires_at: joinTokenExpiresAt,
      google_event_id: googleEventId,
    };

    let { data, error } = await supabase
      .from("tour_bookings")
      .insert(fullInsert)
      .select()
      .single();

    // Schema may be pre-migration; progressively drop unknown columns and retry
    const newCols = ["title", "location", "is_virtual", "meet_link", "extra_guests", "join_token", "join_token_expires_at"];
    let attempts = 0;
    while (error && (error.message.includes("schema cache") || error.message.includes("does not exist")) && attempts < 10) {
      const bad = error.message.match(/'(\w+)' column|column "(\w+)"/);
      const badCol = bad?.[1] || bad?.[2];
      if (!badCol || !(badCol in fullInsert)) break;
      delete fullInsert[badCol];
      const retry = await supabase.from("tour_bookings").insert(fullInsert).select().single();
      data = retry.data;
      error = retry.error;
      attempts++;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Warn in logs if virtual flag was dropped due to schema — the feature is degraded
    if (isVirtual && !Object.prototype.hasOwnProperty.call(fullInsert, "is_virtual")) {
      console.warn("tour_bookings schema missing virtual-tour columns; run supabase/migration_virtual_tours.sql");
    }
    void newCols;

    // Send confirmation email to the visitor (non-blocking)
    const propertyName = body.property_slug
      ? body.property_slug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
      : undefined;

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
    const joinUrl = isVirtual && joinToken ? `${origin}/tour/join/${joinToken}` : null;

    sendTourConfirmation({
      to: body.email,
      firstName: body.first_name,
      lastName: body.last_name,
      tourDate: body.tour_date,
      tourTime: body.tour_time,
      propertyName,
      isVirtual,
      joinUrl,
    }).catch((err) => console.error("Tour confirmation email failed:", err));

    // Notify staff (non-blocking)
    sendStaffNotification({
      type: "tour",
      name: `${body.first_name} ${body.last_name}`,
      email: body.email,
      details: [
        `Date: ${body.tour_date}`,
        `Time: ${body.tour_time}`,
        `Phone: ${body.phone}`,
        propertyName ? `Property: ${propertyName}` : "",
        isVirtual ? `Virtual tour: Yes` : "",
        meetLink ? `Meet link: ${meetLink}` : "",
        extraGuests.length > 0 ? `Extra guests: ${extraGuests.join(", ")}` : "",
      ].filter(Boolean).join("\n"),
    }).catch((err) => console.error("Staff notification email failed:", err));

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to book tour" }, { status: 500 });
  }
}

function parseTimeForExpiry(time: string): [number, number] {
  // "2:30 PM" -> [14, 30]
  const match = time.match(/(\d+)(?::(\d+))?\s*(AM|PM)?/i);
  if (!match) return [12, 0];
  let h = parseInt(match[1], 10);
  const m = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = (match[3] || "").toUpperCase();
  if (meridiem === "PM" && h < 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return [h, m];
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
