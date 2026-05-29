import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { sendMaintenanceCompleted, sendMaintenanceProgress } from "@/lib/email";
import { activityEntry, ActivityEntry } from "@/lib/activity";

const VALID_STATUSES = ["open", "partial", "resolved"];

const STATUS_EVENT: Record<string, string> = {
  open: "Reopened",
  partial: "Marked partially completed",
  resolved: "Marked completed",
};

async function currentLog(id: string): Promise<ActivityEntry[]> {
  const { data } = await supabase
    .from("maintenance_requests")
    .select("activity_log")
    .eq("id", id)
    .single();
  return Array.isArray(data?.activity_log) ? (data.activity_log as ActivityEntry[]) : [];
}

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
    const by = session.username || "staff";

    // Support soft delete
    if (body.deleted_at !== undefined) {
      const log = [...(await currentLog(id)), activityEntry("Moved to recycle bin", by)];
      const { data, error } = await supabase
        .from("maintenance_requests")
        .update({ deleted_at: body.deleted_at, activity_log: log })
        .eq("id", id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (!data) return NextResponse.json({ error: "Request not found" }, { status: 404 });
      return NextResponse.json(data);
    }

    // Internal staff notes can be updated on their own (no status change).
    const hasStaffNotes = body.staff_notes !== undefined;
    const hasStatus = body.status !== undefined;

    if (!hasStatus && !hasStaffNotes) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    if (hasStatus && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const sendEmail = body.send_email === true;
    const update: { status?: string; resolution_notes?: string | null; staff_notes?: string | null; activity_log?: ActivityEntry[] } = {};
    const events: ActivityEntry[] = [];

    if (hasStatus) {
      update.status = body.status;
      events.push(activityEntry(STATUS_EVENT[body.status] || `Status set to ${body.status}`, by));

      // Customer-facing work notes apply to partial and resolved updates.
      if (body.status === "partial" || body.status === "resolved") {
        const notes = typeof body.resolution_notes === "string" ? body.resolution_notes.trim() : "";
        update.resolution_notes = notes || null;
        if (notes) events.push(activityEntry("Customer note added", by));
        if (sendEmail) {
          events.push(
            activityEntry(
              body.status === "resolved"
                ? "Completion notice emailed to tenant"
                : "Progress update emailed to tenant",
              by
            )
          );
        }
      }
    }

    if (hasStaffNotes) {
      const staffNotes = typeof body.staff_notes === "string" ? body.staff_notes.trim() : "";
      update.staff_notes = staffNotes || null;
      // Only log a standalone internal-note save to keep the log concise.
      if (!hasStatus) events.push(activityEntry("Internal note updated", by));
    }

    update.activity_log = [...(await currentLog(id)), ...events];

    const { data, error } = await supabase
      .from("maintenance_requests")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Maintenance request not found" },
        { status: 404 }
      );
    }

    // Email the tenant only with explicit staff consent (send_email).
    if (sendEmail && data.email) {
      try {
        if (body.status === "resolved") {
          await sendMaintenanceCompleted({
            to: data.email,
            name: data.full_name,
            apartment: data.apartment,
            description: data.description,
            resolutionNotes: data.resolution_notes || null,
          });
        } else if (body.status === "partial") {
          await sendMaintenanceProgress({
            to: data.email,
            name: data.full_name,
            apartment: data.apartment,
            description: data.description,
            resolutionNotes: data.resolution_notes || null,
          });
        }
      } catch {
        // Email is best-effort
      }
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update maintenance request" },
      { status: 500 }
    );
  }
}
