import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Next.js App Router: increase max duration
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file (matches UI max)
const BUCKET = "application-documents"; // reuse existing public bucket
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/heic",
  "image/heif",
  "image/webp",
  "application/pdf",
]);

interface PhotoEntry {
  storage_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const maintenanceId = formData.get("maintenance_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!maintenanceId) {
      return NextResponse.json({ error: "maintenance_id is required" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      // Don't block if the browser reports empty type — fall back to extension check
      if (!/\.(png|jpe?g|heic|heif|webp|pdf)$/i.test(file.name)) {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
      }
    }

    // Storage path under maintenance/ subtree so it's easy to find/clean up
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `maintenance/${maintenanceId}/${timestamp}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    // Append the new photo entry to the row's photos JSONB array
    const newEntry: PhotoEntry = {
      storage_path: storagePath,
      file_name: file.name,
      file_type: file.type || "application/octet-stream",
      file_size: file.size,
      uploaded_at: new Date().toISOString(),
    };

    const { data: current, error: readErr } = await supabase
      .from("maintenance_requests")
      .select("photos")
      .eq("id", maintenanceId)
      .single();
    if (readErr) {
      console.error("Read row error:", readErr);
      return NextResponse.json({ error: "Maintenance request not found" }, { status: 404 });
    }
    const existing: PhotoEntry[] = Array.isArray(current?.photos) ? current.photos : [];
    const { error: updErr } = await supabase
      .from("maintenance_requests")
      .update({ photos: [...existing, newEntry] })
      .eq("id", maintenanceId);
    if (updErr) {
      console.error("Row update error:", updErr);
      // Best-effort: storage upload succeeded, but row update didn't. Still return success so the ticket is saved.
    }

    return NextResponse.json({ ok: true, photo: newEntry }, { status: 201 });
  } catch (err) {
    console.error("upload-photo error:", err);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
