-- ============================================================
-- College Place Apartments - Document Upload Setup
-- Run this in Supabase SQL Editor AFTER the main setup.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. APPLICATION DOCUMENTS TABLE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS application_documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid REFERENCES applications(id) ON DELETE CASCADE,
  file_name       text NOT NULL,
  file_type       text NOT NULL,         -- MIME type (e.g., application/pdf, image/jpeg)
  file_size       bigint NOT NULL,       -- Size in bytes
  storage_path    text NOT NULL,         -- Path in Supabase Storage
  document_label  text,                  -- e.g., "ID Document", "Proof of Income", "Student ID"
  uploaded_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_docs_application_id ON application_documents (application_id);

-- Enable RLS
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public insert" ON application_documents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public read"   ON application_documents FOR SELECT TO anon USING (true);

-- ────────────────────────────────────────────────────────────
-- 2. SUPABASE STORAGE BUCKET
-- ────────────────────────────────────────────────────────────
-- Create the storage bucket for application documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-documents',
  'application-documents',
  false,
  10485760,  -- 10MB max file size
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow upload and read via anon key (our API routes use anon key)
CREATE POLICY "Allow anon upload" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'application-documents');

CREATE POLICY "Allow anon read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'application-documents');

-- ============================================================
-- DONE! Created:
--   1. application_documents table (linked to applications)
--   2. application-documents storage bucket (10MB limit)
--   3. Storage policies for upload/read
-- ============================================================
