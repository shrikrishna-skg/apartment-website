import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendStaffNotification } from "@/lib/email";
import { getSession } from "@/lib/auth";

// ALL valid columns in the applications table
const ALL_COLUMNS = new Set([
  // Core
  "applicant_type", "full_name", "ssn", "marital_status", "gender",
  "driving_license", "date_of_birth", "email", "mobile_number",
  "specific_request", "housing_requirement", "preferred_move_in", "lease_duration",
  // Address
  "current_address", "address_type", "city", "state", "zip_code",
  // Education (student)
  "university_name", "student_id", "course_name", "course_start_date",
  "expected_graduation", "advisor_phone", "advisor_email",
  // Emergency contacts
  "emergency_contact_name", "emergency_contact_phone", "emergency_contact_email",
  "emergency_relationship",
  "emergency_contact2_name", "emergency_contact2_phone", "emergency_contact2_email",
  "emergency_relationship2",
  // Employment
  "employment_status", "employer_name", "monthly_income", "income_source",
  "supervisor", "employer_address", "employer_phone", "position_held", "date_of_hire",
  // Co-signer
  "has_cosigner", "cosigner_name", "cosigner_phone", "cosigner_email",
  // Landlord / Residence
  "previous_landlord_name", "landlord_phone", "landlord_address", "landlord_email",
  "reason_for_leaving", "length_of_stay",
  "housing_status", "residence_from", "residence_to", "rent_amount",
  "completed_residence_history",
  // References
  "ref1_name", "ref1_phone", "ref1_relationship",
  "ref2_name", "ref2_phone", "ref2_relationship",
  "references_info",
  // Pets
  "has_pets", "pets", "pet_type", "pet_weight", "pet_age", "is_esa",
  // Vehicle
  "has_vehicle", "vehicle1_make", "vehicle1_year", "vehicle1_color", "vehicle1_plate",
  "has_second_vehicle", "vehicle2_make", "vehicle2_year", "vehicle2_color", "vehicle2_plate",
  // Background check
  "filed_bankruptcy", "bankruptcy_details", "evicted_from_tenancy", "eviction_details",
  "convicted_felony", "felony_details", "arrested_or_convicted", "arrest_details",
  // Authorization
  "agree_terms", "signature_name", "signature_date",
  "consent", "consent_communications",
  // Internal
  "notes",
]);

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

    // Insert with all columns — if a column doesn't exist, retry without it
    let data;
    const { data: d1, error: e1 } = await supabase
      .from("applications")
      .insert(fullBody)
      .select()
      .single();

    if (e1 && e1.message.includes("schema cache")) {
      // A column doesn't exist — extract the bad column name and retry
      const match = e1.message.match(/the '(\w+)' column/);
      const badCol = match?.[1];
      const retryBody = { ...fullBody };
      const extraData: Record<string, unknown> = {};

      if (badCol) {
        // Remove the bad column and any others that might fail
        const potentialNewCols = ["gender", "address_type", "course_name", "course_start_date",
          "advisor_phone", "advisor_email", "emergency_contact_email",
          "emergency_contact2_name", "emergency_contact2_phone", "emergency_contact2_email",
          "emergency_relationship2", "has_pets", "pets", "has_vehicle",
          "vehicle1_make", "vehicle1_year", "vehicle1_color", "vehicle1_plate",
          "has_second_vehicle", "vehicle2_make", "vehicle2_year", "vehicle2_color", "vehicle2_plate",
          "filed_bankruptcy", "bankruptcy_details", "evicted_from_tenancy", "eviction_details",
          "convicted_felony", "felony_details", "arrested_or_convicted", "arrest_details",
          "agree_terms", "signature_name", "signature_date", "consent_communications",
          "pet_type", "pet_weight", "pet_age", "is_esa", "references_info",
          "supervisor", "employer_address", "employer_phone", "position_held", "date_of_hire",
          "housing_status", "residence_from", "residence_to", "landlord_email", "rent_amount",
          "completed_residence_history"];
        for (const col of potentialNewCols) {
          if (retryBody[col] !== undefined) {
            extraData[col] = retryBody[col];
            delete retryBody[col];
          }
        }
      }

      if (Object.keys(extraData).length > 0) {
        retryBody.notes = JSON.stringify(extraData);
      }

      const { data: d2, error: e2 } = await supabase
        .from("applications")
        .insert(retryBody)
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
