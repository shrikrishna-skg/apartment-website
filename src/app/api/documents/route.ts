import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - List documents for an application
export async function GET(request: NextRequest) {
  try {
    const applicationId = request.nextUrl.searchParams.get("application_id");

    if (!applicationId) {
      return NextResponse.json(
        { error: "application_id query parameter is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("application_documents")
      .select("*")
      .eq("application_id", applicationId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
