-- =============================================
-- Migration: maintenance_requests activity log + retire 'in_progress' status
--   - activity_log: append-only list of system events for each request
--   - 'in_progress' is no longer used; migrate existing rows to 'open'
-- =============================================

-- Per-request activity log (system events: created, status changes, notes, emails)
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS activity_log JSONB DEFAULT '[]'::jsonb;

-- Retire the 'in_progress' status: move any existing rows to 'open'
UPDATE maintenance_requests SET status = 'open' WHERE status = 'in_progress';
