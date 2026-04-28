-- =============================================
-- Migration: Add resolution_notes column to maintenance_requests
-- Notes staff add when marking a request resolved (shown in tenant email)
-- =============================================

ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS resolution_notes TEXT;
