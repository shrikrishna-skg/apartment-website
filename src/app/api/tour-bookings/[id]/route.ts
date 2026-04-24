import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import {
  sendTourConfirmation,
  sendTourRescheduled,
  sendTourCancelled,
} from "@/lib/email";

const VALID_STATUSES = ["confirmed", "completed", "cancelled", "no_show"];

// Fields staff can edit on an existing booking
const EDITABLE_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "tour_date",
  "tour_time",
  "property_slug",
  "floor_plan",
  "notes",
  "title",
  "location",
  "is_virtual",
  "meet_link",
  "extra_guests",
  "status",
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Support soft delete
    if (body.deleted_at !== undefined) {
      const { data, error } = await supabase
        .from("tour_bookings")
        .update({ deleted_at: body.deleted_at })
        .eq("id", id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (!data) return NextResponse.json({ error: "Tour booking not found" }, { status: 404 });
      return NextResponse.json(data);
    }

    // Fetch existing booking to diff against
    const { data: existing, error: fetchErr } = await supabase
      .from("tour_bookings")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();
    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Tour booking not found" }, { status: 404 });
    }

    // Build update object from editable fields present in body
    const update: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        update[field] = body[field];
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No editable fields supplied" }, { status: 400 });
    }

    // Validate status if provided
    if (update.status && !VALID_STATUSES.includes(update.status as string)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // If date/time changing, check the new slot isn't taken by a different booking
    const newDate = (update.tour_date as string) || existing.tour_date;
    const newTime = (update.tour_time as string) || existing.tour_time;
    const dateTimeChanged = newDate !== existing.tour_date || newTime !== existing.tour_time;
    if (dateTimeChanged) {
      const { data: conflicts } = await supabase
        .from("tour_bookings")
        .select("id")
        .eq("tour_date", newDate)
        .eq("tour_time", newTime)
        .neq("status", "cancelled")
        .neq("id", id)
        .is("deleted_at", null);
      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          { error: `The ${newTime} slot on ${newDate} is already booked.` },
          { status: 409 }
        );
      }
    }

    // Apply update, with resilience to pre-migration schemas (unknown columns get dropped)
    const insertBody = { ...update };
    let { data, error } = await supabase
      .from("tour_bookings")
      .update(insertBody)
      .eq("id", id)
      .select()
      .single();

    let attempts = 0;
    while (error && (error.message.includes("schema cache") || error.message.includes("does not exist")) && attempts < 10) {
      const match = error.message.match(/'(\w+)' column|column "(\w+)"/);
      const badCol = match?.[1] || match?.[2];
      if (!badCol || !(badCol in insertBody)) break;
      delete insertBody[badCol];
      const retry = await supabase.from("tour_bookings").update(insertBody).eq("id", id).select().single();
      data = retry.data;
      error = retry.error;
      attempts++;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: "Tour booking not found" }, { status: 404 });

    // Decide which email to send based on what changed
    const statusBefore = existing.status;
    const statusAfter = data.status;
    const emailStatus: { kind: string; result: string } = { kind: "none", result: "skipped" };

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
    const propertyName = data.property_slug
      ? String(data.property_slug).replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
      : undefined;
    const joinUrl = data.is_virtual && data.join_token ? `${origin}/tour/join/${data.join_token}` : null;

    try {
      if (statusAfter === "cancelled" && statusBefore !== "cancelled") {
        emailStatus.kind = "cancelled";
        const msgId = await sendTourCancelled({
          to: data.email,
          firstName: data.first_name,
          tourDate: data.tour_date,
          tourTime: data.tour_time,
          propertyName,
        });
        emailStatus.result = msgId ? `sent:${msgId}` : "skipped_no_smtp";
      } else if (dateTimeChanged && statusAfter !== "cancelled") {
        emailStatus.kind = "rescheduled";
        const msgId = await sendTourRescheduled({
          to: data.email,
          firstName: data.first_name,
          oldDate: existing.tour_date,
          oldTime: existing.tour_time,
          newDate: data.tour_date,
          newTime: data.tour_time,
          propertyName,
          isVirtual: !!data.is_virtual,
          joinUrl,
        });
        emailStatus.result = msgId ? `sent:${msgId}` : "skipped_no_smtp";
      } else if (Object.keys(update).some((k) => k !== "status") && statusAfter !== "cancelled") {
        // Generic update (non-status, non-date-time) — re-send confirmation with latest details
        emailStatus.kind = "updated";
        const msgId = await sendTourConfirmation({
          to: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          tourDate: data.tour_date,
          tourTime: data.tour_time,
          propertyName,
          isVirtual: !!data.is_virtual,
          joinUrl,
        });
        emailStatus.result = msgId ? `sent:${msgId}` : "skipped_no_smtp";
      }
      console.log(`[tour-bookings/${id}] email ${emailStatus.kind}: ${emailStatus.result}`);
    } catch (err) {
      emailStatus.result = `failed:${err instanceof Error ? err.message : String(err)}`;
      console.error("Tour update email failed:", err);
    }

    return NextResponse.json({ ...data, _email_status: emailStatus });
  } catch {
    return NextResponse.json(
      { error: "Failed to update tour booking" },
      { status: 500 }
    );
  }
}
