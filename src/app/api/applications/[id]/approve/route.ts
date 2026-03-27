import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { sendApprovalEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const shouldSendEmail = body.sendEmail === true;

    // Update the application status to approved
    const { data, error } = await supabase
      .from("applications")
      .update({ status: "approved" })
      .eq("id", id)
      .select("id, full_name, email, status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Only send approval email if admin explicitly requested it
    let emailSent = false;
    if (shouldSendEmail && data.email && data.full_name) {
      emailSent = await sendApprovalEmail(data.full_name, data.email);
    }

    return NextResponse.json({
      ...data,
      emailSent,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to approve application" },
      { status: 500 }
    );
  }
}
