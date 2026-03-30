import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { sendInquiryReply } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { replyMessage } = await request.json();

    if (!replyMessage?.trim()) {
      return NextResponse.json({ error: "Reply message is required" }, { status: 400 });
    }

    // Fetch inquiry
    const { data: inquiry, error: dbError } = await supabase
      .from("contact_inquiries")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (dbError || !inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Send reply email
    const messageId = await sendInquiryReply({
      to: inquiry.email,
      name: inquiry.name,
      originalMessage: inquiry.message || "",
      replyMessage: replyMessage.trim(),
      inquiryType: inquiry.inquiry_type,
    });

    // Update status to "contacted" if currently "new"
    if (inquiry.status === "new") {
      await supabase
        .from("contact_inquiries")
        .update({ status: "contacted" })
        .eq("id", id);
    }

    return NextResponse.json({
      success: true,
      messageId,
      statusUpdated: inquiry.status === "new",
    });
  } catch (err) {
    console.error("Reply error:", err);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
