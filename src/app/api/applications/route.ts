import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendStaffNotification } from "@/lib/email";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("applications")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Send email notification to office (best-effort)
    try {
      const typeLabel =
        body.applicant_type === "student" ? "Student" :
        body.applicant_type === "international" ? "International Student" :
        "Working Professional / General";

      const details = [
        `Type: ${typeLabel}`,
        body.mobile_number ? `Phone: ${body.mobile_number}` : null,
        body.university_name ? `University: ${body.university_name}` : null,
        body.employer_name ? `Employer: ${body.employer_name}` : null,
        body.housing_requirement ? `Housing: ${body.housing_requirement}` : null,
        body.preferred_move_in ? `Move-in: ${body.preferred_move_in}` : null,
        body.lease_duration ? `Lease: ${body.lease_duration}` : null,
        body.monthly_income ? `Monthly Income: ${body.monthly_income}` : null,
        body.has_cosigner ? `Co-signer: ${body.cosigner_name || "Yes"}` : null,
      ].filter(Boolean).join("\n");

      await sendStaffNotification({
        type: "application",
        name: body.full_name || "Unknown",
        email: body.email || "N/A",
        details,
      });
    } catch {
      // Email is best-effort
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit application" },
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
      .from("applications")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
