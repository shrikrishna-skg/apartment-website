import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendStaffNotification } from "@/lib/email";
import { getSession } from "@/lib/auth";

// Columns that definitely exist in the original schema
const SAFE_COLUMNS = new Set([
  "applicant_type", "full_name", "ssn", "marital_status",
  "driving_license", "date_of_birth", "email", "mobile_number",
  "specific_request", "housing_requirement", "preferred_move_in", "lease_duration",
  "current_address", "city", "state", "zip_code",
  "university_name", "student_id", "expected_graduation",
  "emergency_contact_name", "emergency_contact_phone", "emergency_relationship",
  "employment_status", "employer_name", "monthly_income", "income_source",
  "has_cosigner", "cosigner_name", "cosigner_phone", "cosigner_email",
  "previous_landlord_name", "landlord_phone", "landlord_address",
  "reason_for_leaving", "length_of_stay",
  "ref1_name", "ref1_phone", "ref1_relationship",
  "ref2_name", "ref2_phone", "ref2_relationship",
  "consent", "notes",
]);

// New columns added by migration (may not exist yet)
const NEW_COLUMNS = new Set([
  "gender", "address_type", "course_name", "course_start_date",
  "advisor_phone", "advisor_email",
  "emergency_contact_email", "emergency_contact2_name", "emergency_contact2_phone",
  "emergency_contact2_email", "emergency_relationship2",
  "has_pets", "pets", "has_vehicle",
  "vehicle1_make", "vehicle1_year", "vehicle1_color", "vehicle1_plate",
  "filed_bankruptcy", "bankruptcy_details", "evicted_from_tenancy", "eviction_details",
  "convicted_felony", "felony_details", "arrested_or_convicted", "arrest_details",
  "agree_terms", "signature_name", "signature_date",
]);

const ALL_COLUMNS = new Set([...SAFE_COLUMNS, ...NEW_COLUMNS]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Try inserting with all columns first
    const fullBody: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (ALL_COLUMNS.has(key)) {
        fullBody[key] = value;
      }
    }

    let data;
    const { data: d1, error: e1 } = await supabase
      .from("applications")
      .insert(fullBody)
      .select()
      .single();

    if (e1 && e1.message.includes("schema cache")) {
      // Migration not run yet — fall back to safe columns + store extras in notes
      const safeBody: Record<string, unknown> = {};
      const extraData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(body)) {
        if (SAFE_COLUMNS.has(key)) {
          safeBody[key] = value;
        } else if (NEW_COLUMNS.has(key)) {
          extraData[key] = value;
        }
      }
      if (Object.keys(extraData).length > 0) {
        safeBody.notes = JSON.stringify(extraData);
      }

      const { data: d2, error: e2 } = await supabase
        .from("applications")
        .insert(safeBody)
        .select()
        .single();

      if (e2) {
        return NextResponse.json({ error: e2.message }, { status: 400 });
      }
      data = d2;
    } else if (e1) {
      return NextResponse.json({ error: e1.message }, { status: 400 });
    } else {
      data = d1;
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
