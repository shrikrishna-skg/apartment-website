import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendStaffNotification, sendApplicationReceived } from "@/lib/email";
import { getSession } from "@/lib/auth";

// BLOCKLIST approach: reject only system/dangerous fields.
// Everything else from the form is accepted and sent to the DB.
// This ensures new form fields are NEVER silently dropped.
const BLOCKED_FIELDS = new Set([
  "id", "created_at", "updated_at", "deleted_at", "status",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Accept ALL fields except blocked ones — no whitelist to maintain
    const insertBody: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!BLOCKED_FIELDS.has(key) && typeof key === "string" && /^[a-z][a-z0-9_]*$/.test(key)) {
        insertBody[key] = value;
      }
    }

    // Try to insert — if a column doesn't exist, store extras in notes JSON
    let data;
    const { data: d1, error: e1 } = await supabase
      .from("applications")
      .insert(insertBody)
      .select()
      .single();

    if (e1 && e1.message.includes("schema cache")) {
      // Extract the missing column name and progressively remove bad columns
      const retryBody = { ...insertBody };
      const extraData: Record<string, unknown> = {};
      let lastError = e1;

      // Retry up to 10 times, removing one bad column each time
      for (let attempt = 0; attempt < 10; attempt++) {
        const match = lastError.message.match(/the '(\w+)' column/);
        if (!match) break;
        const badCol = match[1];
        if (retryBody[badCol] !== undefined) {
          extraData[badCol] = retryBody[badCol];
          delete retryBody[badCol];
        }

        if (Object.keys(extraData).length > 0) {
          retryBody.notes = JSON.stringify(extraData);
        }

        const { data: d2, error: e2 } = await supabase
          .from("applications")
          .insert(retryBody)
          .select()
          .single();

        if (!e2) {
          data = d2;
          break;
        } else if (e2.message.includes("schema cache")) {
          lastError = e2;
          continue;
        } else {
          return NextResponse.json({ error: e2.message }, { status: 400 });
        }
      }

      if (!data) {
        return NextResponse.json({ error: lastError.message }, { status: 400 });
      }
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

      const emails: Promise<unknown>[] = [
        sendStaffNotification({
          type: "application",
          name: body.full_name || "Unknown",
          email: body.email || "N/A",
          details,
        }),
      ];
      if (body.email?.trim()) {
        emails.push(
          sendApplicationReceived({
            to: body.email.trim(),
            name: body.full_name?.trim() || "Applicant",
            applicantType: body.applicant_type || null,
          })
        );
      }
      await Promise.all(emails);
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
