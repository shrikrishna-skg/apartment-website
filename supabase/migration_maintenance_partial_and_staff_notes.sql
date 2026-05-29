-- =============================================
-- Migration: Add 'partial' status + internal staff_notes to maintenance_requests
--   - 'partial' (Partially Completed) status sits before 'resolved' (Completed)
--   - staff_notes: internal notes for staff only, never shown to tenants/customers
-- =============================================

-- Allow the new 'partial' status value
ALTER TABLE maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_status_check;
ALTER TABLE maintenance_requests
  ADD CONSTRAINT maintenance_requests_status_check
  CHECK (status IN ('open', 'in_progress', 'partial', 'resolved', 'closed'));

-- Internal staff-only notes (never emailed / never shown to tenants)
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS staff_notes TEXT;
