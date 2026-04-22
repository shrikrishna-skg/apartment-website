import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { sendMaintenanceCompleted } from "@/lib/email";

const VALID_STATUSES = ["open", "in_progress", "resolved"];

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
        .from("maintenance_requests")
        .update({ deleted_at: body.deleted_at })
        .eq("id", id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (!data) return NextResponse.json({ error: "Request not found" }, { status: 404 });
      return NextResponse.json(data);
    }

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("maintenance_requests")
      .update({ status: body.status })
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

    // Send completion email when status is resolved
    if (body.status === "resolved" && data.email) {
      try {
        await sendMaintenanceCompleted({
          to: data.email,
          name: data.full_name,
          apartment: data.apartment,
          description: data.description,
        });
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
