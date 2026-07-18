-- =============================================
-- Migration: Newsletter rotation + unsubscribe
-- Run this on your Supabase database (SQL editor)
-- =============================================

-- Per-subscriber newsletter state
ALTER TABLE email_subscribers ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT;
ALTER TABLE email_subscribers ADD COLUMN IF NOT EXISTS unsubscribed_at   TIMESTAMPTZ;
ALTER TABLE email_subscribers ADD COLUMN IF NOT EXISTS sent_slugs        TEXT[] DEFAULT '{}';
ALTER TABLE email_subscribers ADD COLUMN IF NOT EXISTS last_sent_at      TIMESTAMPTZ;

-- Give every existing subscriber a unique unsubscribe token
UPDATE email_subscribers
   SET unsubscribe_token = gen_random_uuid()::text
 WHERE unsubscribe_token IS NULL;

-- Fast, unique lookups by token (used by the unsubscribe link)
CREATE UNIQUE INDEX IF NOT EXISTS email_subscribers_unsub_token_idx
    ON email_subscribers (unsubscribe_token);
