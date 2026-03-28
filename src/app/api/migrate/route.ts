import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MIGRATION_COLUMNS = [
  // Personal
  { name: "gender", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS gender TEXT" },
  { name: "address_type", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS address_type TEXT" },
  // Education
  { name: "course_name", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS course_name TEXT" },
  { name: "course_start_date", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS course_start_date TEXT" },
  { name: "advisor_phone", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS advisor_phone TEXT" },
  { name: "advisor_email", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS advisor_email TEXT" },
  // Emergency Contact 2
  { name: "emergency_contact_email", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT" },
  { name: "emergency_contact2_name", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact2_name TEXT" },
  { name: "emergency_contact2_phone", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact2_phone TEXT" },
  { name: "emergency_contact2_email", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact2_email TEXT" },
  { name: "emergency_relationship2", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_relationship2 TEXT" },
  // Pets & Vehicle
  { name: "has_pets", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_pets BOOLEAN DEFAULT false" },
  { name: "pets", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS pets JSONB DEFAULT '[]'::jsonb" },
  { name: "has_vehicle", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_vehicle BOOLEAN DEFAULT false" },
  { name: "vehicle1_make", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_make TEXT" },
  { name: "vehicle1_year", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_year TEXT" },
  { name: "vehicle1_color", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_color TEXT" },
  { name: "vehicle1_plate", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_plate TEXT" },
  // Background Check
  { name: "filed_bankruptcy", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS filed_bankruptcy BOOLEAN DEFAULT false" },
  { name: "bankruptcy_details", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS bankruptcy_details TEXT" },
  { name: "evicted_from_tenancy", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS evicted_from_tenancy BOOLEAN DEFAULT false" },
  { name: "eviction_details", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS eviction_details TEXT" },
  { name: "convicted_felony", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS convicted_felony BOOLEAN DEFAULT false" },
  { name: "felony_details", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS felony_details TEXT" },
  { name: "arrested_or_convicted", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS arrested_or_convicted BOOLEAN DEFAULT false" },
  { name: "arrest_details", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS arrest_details TEXT" },
  // Authorization
  { name: "agree_terms", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS agree_terms BOOLEAN DEFAULT false" },
  { name: "signature_name", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS signature_name TEXT" },
  { name: "signature_date", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS signature_date TEXT" },
  { name: "consent_communications", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS consent_communications BOOLEAN DEFAULT false" },
];

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

  // Step 1: Create the exec_sql function if it doesn't exist
  // This uses the service role key which has full DB access
  try {
    // Try creating a helper function to run DDL
    const { error: fnError } = await supabase.rpc("exec_sql", {
      query: "SELECT 1",
    });

    if (fnError && fnError.message.includes("Could not find")) {
      // Function doesn't exist — we can't run DDL via REST API
      // Fall back to checking which columns exist and reporting
      results.push("exec_sql function not available — checking columns instead");

      for (const col of MIGRATION_COLUMNS) {
        const { error } = await supabase
          .from("applications")
          .select(col.name)
          .limit(1);

        if (error && (error.message.includes("does not exist") || error.message.includes("schema cache"))) {
          results.push(`MISSING: ${col.name}`);
        } else {
          results.push(`EXISTS: ${col.name}`);
        }
      }

      const missing = results.filter((r) => r.startsWith("MISSING"));
      return NextResponse.json({
        status: missing.length > 0 ? "migration_needed" : "all_columns_exist",
        missing: missing.length,
        existing: results.filter((r) => r.startsWith("EXISTS")).length,
        results,
        sql: missing.length > 0
          ? MIGRATION_COLUMNS.filter((c) => missing.some((m) => m.includes(c.name)))
              .map((c) => c.sql + ";")
              .join("\n")
          : null,
        instructions: missing.length > 0
          ? "Copy the SQL below and run it in Supabase Dashboard → SQL Editor → New Query → Run"
          : "All columns exist. No migration needed.",
      });
    }
  } catch {
    // Continue with column check
  }

  // If exec_sql works, run the migration
  for (const col of MIGRATION_COLUMNS) {
    try {
      const { error } = await supabase.rpc("exec_sql", { query: col.sql });
      if (error) {
        results.push(`ERROR: ${col.name} — ${error.message}`);
      } else {
        results.push(`OK: ${col.name}`);
      }
    } catch (err) {
      results.push(`FAILED: ${col.name} — ${err}`);
    }
  }

  return NextResponse.json({
    status: "migration_executed",
    results,
  });
}
