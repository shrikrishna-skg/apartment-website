import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const STATEMENTS = [
  "ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS title TEXT",
  "ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS location TEXT",
  "ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT false",
  "ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS meet_link TEXT",
  "ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS extra_guests TEXT[] DEFAULT '{}'",
  "ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS join_token TEXT",
  "ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS join_token_expires_at TIMESTAMPTZ",
  "ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS join_token_used_at TIMESTAMPTZ",
  "CREATE UNIQUE INDEX IF NOT EXISTS tour_bookings_join_token_key ON tour_bookings (join_token) WHERE join_token IS NOT NULL",
];

export async function POST(request: NextRequest) {
  const { secret } = await request.json().catch(() => ({}));
  if (secret !== "run-migration-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prefer RPC exec_sql; fall back to probing columns if unavailable.
  const results: string[] = [];
  let execSqlAvailable = true;
  try {
    const { error } = await supabase.rpc("exec_sql", { query: "SELECT 1" });
    if (error && error.message.includes("Could not find")) execSqlAvailable = false;
  } catch {
    execSqlAvailable = false;
  }

  if (execSqlAvailable) {
    for (const sql of STATEMENTS) {
      const { error } = await supabase.rpc("exec_sql", { query: sql });
      results.push(error ? `ERR: ${sql} — ${error.message}` : `OK: ${sql}`);
    }
    return NextResponse.json({ status: "executed", results });
  }

  // Fallback: return SQL for manual run
  return NextResponse.json({
    status: "manual_run_required",
    instructions: "Run the SQL below in Supabase Dashboard → SQL Editor",
    sql: STATEMENTS.map((s) => s + ";").join("\n"),
  });
}
