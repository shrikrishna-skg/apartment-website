-- Virtual tours + Google Meet + tokenized join URL
-- Safe to run multiple times.

ALTER TABLE tour_bookings
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS meet_link TEXT,
  ADD COLUMN IF NOT EXISTS extra_guests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS join_token TEXT,
  ADD COLUMN IF NOT EXISTS join_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS join_token_used_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS tour_bookings_join_token_key ON tour_bookings (join_token) WHERE join_token IS NOT NULL;
