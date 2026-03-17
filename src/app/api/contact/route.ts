import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendStaffNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ["name", "email", "message", "inquiry_type"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("contact_inquiries")
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        property_slug: body.property_slug || null,
        message: body.message,
        inquiry_type: body.inquiry_type,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Send staff notification (best-effort)
    try {
      const typeLabels: Record<string, string> = {
        general: "General Inquiry",
        lease: "Lease Inquiry",
        maintenance: "Maintenance",
        pricing: "Pricing Question",
        other: "Other",
      };

      const details = [
        `Type: ${typeLabels[body.inquiry_type] || body.inquiry_type}`,
        body.phone ? `Phone: ${body.phone}` : null,
        body.property_slug ? `Property: ${body.property_slug}` : null,
        `\nMessage:\n${body.message}`,
      ].filter(Boolean).join("\n");

      await sendStaffNotification({
        type: "inquiry",
        name: body.name,
        email: body.email,
        details,
      });
    } catch {
      // Email is best-effort
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit contact inquiry" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("contact_inquiries")
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
      { error: "Failed to fetch contact inquiries" },
      { status: 500 }
    );
  }
}
