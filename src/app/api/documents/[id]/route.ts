import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// GET - Download/view a document by its ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Get document record
    const { data: doc, error: dbError } = await supabase
      .from("application_documents")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Generate a signed URL (valid for 1 hour) instead of proxying the file
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("application-documents")
      .createSignedUrl(doc.storage_path, 3600);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", signedUrlError);

      // Fallback: try direct download and proxy
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("application-documents")
        .download(doc.storage_path);

      if (downloadError || !fileData) {
        console.error("Storage download error:", downloadError);
        return NextResponse.json(
          { error: "Failed to retrieve document from storage" },
          { status: 500 }
        );
      }

      const disposition = request.nextUrl.searchParams.get("download") === "1"
        ? `attachment; filename="${doc.file_name}"`
        : `inline; filename="${doc.file_name}"`;

      const buffer = Buffer.from(await fileData.arrayBuffer());

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": doc.file_type,
          "Content-Disposition": disposition,
          "Content-Length": String(buffer.length),
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    // Check if download param is set — for downloads, add disposition header via redirect
    const isDownload = request.nextUrl.searchParams.get("download") === "1";
    const redirectUrl = isDownload
      ? `${signedUrlData.signedUrl}&response-content-disposition=${encodeURIComponent(`attachment; filename="${doc.file_name}"`)}`
      : signedUrlData.signedUrl;

    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("Document retrieval error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve document" },
      { status: 500 }
    );
  }
}
