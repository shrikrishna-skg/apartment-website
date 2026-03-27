-- =============================================
-- Migration: Add missing columns to applications table
-- Run this on your Supabase database
-- =============================================

-- Personal Info additions
ALTER TABLE applications ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS address_type TEXT;

-- Education additions
ALTER TABLE applications ADD COLUMN IF NOT EXISTS course_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS course_start_date DATE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS advisor_phone TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS advisor_email TEXT;

-- Emergency Contact additions
ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact2_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact2_phone TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact2_email TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_relationship2 TEXT;

-- Pets & Vehicle (JSONB for multiple pets)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_pets BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS pets JSONB DEFAULT '[]'::jsonb;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_vehicle BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_make TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_year TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_color TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_plate TEXT;

-- Background Check
ALTER TABLE applications ADD COLUMN IF NOT EXISTS filed_bankruptcy BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS bankruptcy_details TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS evicted_from_tenancy BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS eviction_details TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS convicted_felony BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS felony_details TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS arrested_or_convicted BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS arrest_details TEXT;

-- Authorization & Signature
ALTER TABLE applications ADD COLUMN IF NOT EXISTS agree_terms BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS signature_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS signature_date DATE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS consent_communications BOOLEAN DEFAULT false;

-- Index on email for lookups
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
