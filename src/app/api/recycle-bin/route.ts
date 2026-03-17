import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ALLOWED_TABLES = [
  "applications",
  "contact_inquiries",
  "tour_bookings",
  "maintenance_requests",
  "referrals",
  "email_subscribers",
] as const;

type TableName = (typeof ALLOWED_TABLES)[number];

const TABLE_LABELS: Record<TableName, string> = {
  applications: "Application",
  contact_inquiries: "Inquiry",
  tour_bookings: "Tour Booking",
  maintenance_requests: "Maintenance Request",
  referrals: "Referral",
  email_subscribers: "Subscriber",
};

const TABLE_NAME_FIELD: Record<TableName, string> = {
  applications: "full_name",
  contact_inquiries: "name",
  tour_bookings: "first_name",
  maintenance_requests: "full_name",
  referrals: "referrer_name",
  email_subscribers: "email",
};

// GET - List all soft-deleted items across all tables
export async function GET() {
  try {
    const results: Array<{
      id: string;
      table: string;
      type_label: string;
      name: string;
      email: string;
      deleted_at: string;
      created_at: string;
      extra?: string;
    }> = [];

    for (const table of ALLOWED_TABLES) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (error || !data) continue;

      for (const row of data) {
        const nameField = TABLE_NAME_FIELD[table];
        let name = row[nameField] || "";
        if (table === "tour_bookings") {
          name = `${row.first_name} ${row.last_name}`;
        }

        let extra: string | undefined;
        if (table === "applications") extra = row.applicant_type;
        if (table === "tour_bookings") extra = row.tour_date;
        if (table === "maintenance_requests") extra = `Apt ${row.apartment}`;
        if (table === "contact_inquiries") extra = row.inquiry_type;

        results.push({
          id: row.id,
          table,
          type_label: TABLE_LABELS[table],
          name,
          email: row.email || "",
          deleted_at: row.deleted_at,
          created_at: row.created_at,
          extra,
        });
      }
    }

    // Sort all by deleted_at descending
    results.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Failed to fetch recycle bin" }, { status: 500 });
  }
}

// POST - Restore an item (clear deleted_at)
export async function POST(request: NextRequest) {
  try {
    const { table, id } = await request.json();

    if (!table || !id) {
      return NextResponse.json({ error: "table and id are required" }, { status: 400 });
    }

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(table)
      .update({ deleted_at: null })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ restored: true, data });
  } catch {
    return NextResponse.json({ error: "Failed to restore item" }, { status: 500 });
  }
}

// DELETE - Permanently delete an item
export async function DELETE(request: NextRequest) {
  try {
    const { table, id } = await request.json();

    if (!table || !id) {
      return NextResponse.json({ error: "table and id are required" }, { status: 400 });
    }

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    // If it's an application, also delete associated documents from storage
    if (table === "applications") {
      // Get all documents for this application
      const { data: docs } = await supabase
        .from("application_documents")
        .select("storage_path")
        .eq("application_id", id);

      if (docs && docs.length > 0) {
        // Delete files from storage
        const paths = docs.map((d) => d.storage_path);
        await supabase.storage.from("application-documents").remove(paths);
        // Documents will be cascade-deleted by FK constraint
      }
    }

    // Delete the record
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Failed to permanently delete item" }, { status: 500 });
  }
}
