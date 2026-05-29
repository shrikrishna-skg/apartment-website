import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendStaffNotification, sendMaintenanceReceived } from "@/lib/email";
import { getSession } from "@/lib/auth";
import { activityEntry } from "@/lib/activity";

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
        property_name: body.property_name?.trim() || null,
        apartment: body.apartment.trim(),
        full_name: body.full_name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || null,
        category: validCategories.includes(body.category) ? body.category : null,
        urgency: validUrgencies.includes(body.urgency) ? body.urgency : "medium",
        description: body.description.trim(),
        preferred_date: body.preferred_date || null,
        preferred_time: body.preferred_time?.trim() || null,
        entry_notes: body.entry_notes?.trim() || null,
        activity_log: [
          activityEntry("Request submitted"),
          activityEntry("Confirmation emailed to tenant"),
        ],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send staff notification + tenant confirmation (best-effort)
    try {
      const details = [
        body.property_name ? `Property: ${body.property_name}` : null,
        `Apartment: ${body.apartment}`,
        body.category ? `Category: ${body.category}` : null,
        `Urgency: ${body.urgency || "medium"}`,
        body.phone ? `Phone: ${body.phone}` : null,
        body.preferred_date ? `Preferred Date: ${body.preferred_date}` : null,
        body.preferred_time ? `Preferred Time: ${body.preferred_time}` : null,
        body.entry_notes ? `Entry Notes: ${body.entry_notes}` : null,
        `\nDescription:\n${body.description}`,
      ].filter(Boolean).join("\n");

      await Promise.all([
        sendStaffNotification({
          type: "maintenance",
          name: body.full_name,
          email: body.email,
          details,
        }),
        sendMaintenanceReceived({
          to: body.email.trim(),
          name: body.full_name.trim(),
          apartment: body.apartment.trim(),
          description: body.description.trim(),
          category: body.category || null,
          urgency: body.urgency || "medium",
        }),
      ]);
    } catch {
      // Email is best-effort
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
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
