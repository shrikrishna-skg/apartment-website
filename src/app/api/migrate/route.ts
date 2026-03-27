import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { secret } = await request.json().catch(() => ({}));
  if (secret !== "run-migration-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
  }

  const supabase = createClient(url, key);
  const results: string[] = [];

  // Run each ALTER TABLE individually via rpc or direct column check
  const columns = [
    { name: "gender", type: "TEXT" },
    { name: "address_type", type: "TEXT" },
    { name: "course_name", type: "TEXT" },
    { name: "course_start_date", type: "TEXT" },
    { name: "advisor_phone", type: "TEXT" },
    { name: "advisor_email", type: "TEXT" },
    { name: "emergency_contact_email", type: "TEXT" },
    { name: "emergency_contact2_name", type: "TEXT" },
    { name: "emergency_contact2_phone", type: "TEXT" },
    { name: "emergency_contact2_email", type: "TEXT" },
    { name: "emergency_relationship2", type: "TEXT" },
    { name: "has_pets", type: "BOOLEAN" },
    { name: "pets", type: "JSONB" },
    { name: "has_vehicle", type: "BOOLEAN" },
    { name: "vehicle1_make", type: "TEXT" },
    { name: "vehicle1_year", type: "TEXT" },
    { name: "vehicle1_color", type: "TEXT" },
    { name: "vehicle1_plate", type: "TEXT" },
    { name: "filed_bankruptcy", type: "BOOLEAN" },
    { name: "bankruptcy_details", type: "TEXT" },
    { name: "evicted_from_tenancy", type: "BOOLEAN" },
    { name: "eviction_details", type: "TEXT" },
    { name: "convicted_felony", type: "BOOLEAN" },
    { name: "felony_details", type: "TEXT" },
    { name: "arrested_or_convicted", type: "BOOLEAN" },
    { name: "arrest_details", type: "TEXT" },
    { name: "agree_terms", type: "BOOLEAN" },
    { name: "signature_name", type: "TEXT" },
    { name: "signature_date", type: "TEXT" },
    { name: "consent_communications", type: "BOOLEAN" },
  ];

  // Test if columns exist by trying to select them
  for (const col of columns) {
    try {
      const { error } = await supabase
        .from("applications")
        .select(col.name)
        .limit(1);

      if (error && error.message.includes("does not exist")) {
        results.push(`MISSING: ${col.name} (${col.type}) - needs ALTER TABLE`);
      } else if (error) {
        results.push(`ERROR checking ${col.name}: ${error.message}`);
      } else {
        results.push(`EXISTS: ${col.name}`);
      }
    } catch (err) {
      results.push(`FAILED: ${col.name} - ${err}`);
    }
  }

  const missing = results.filter(r => r.startsWith("MISSING"));

  return NextResponse.json({
    status: missing.length > 0 ? "migration_needed" : "all_columns_exist",
    total: columns.length,
    existing: results.filter(r => r.startsWith("EXISTS")).length,
    missing: missing.length,
    results,
    instructions: missing.length > 0
      ? "Run supabase/migration_add_missing_columns.sql in Supabase Dashboard > SQL Editor"
      : "All columns are present. No migration needed.",
  });
}
