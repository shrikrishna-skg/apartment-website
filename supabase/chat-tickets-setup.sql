-- Chat Tickets table for AI chatbot auto-generated tickets
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS chat_tickets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id TEXT NOT NULL UNIQUE,
  user_name TEXT DEFAULT 'Website Visitor',
  user_email TEXT DEFAULT 'N/A',
  category TEXT DEFAULT 'chat-auto',
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('emergency', 'high', 'normal')),
  unit_info TEXT,
  preferred_time TEXT,
  availability TEXT,
  has_image BOOLEAN DEFAULT FALSE,
  image_description TEXT,
  summary TEXT NOT NULL,
  conversation TEXT,
  ai_response TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chat_tickets ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon key (chatbot creates tickets)
CREATE POLICY "Allow chatbot to insert tickets"
  ON chat_tickets FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow reading all tickets (for staff dashboard)
CREATE POLICY "Allow reading tickets"
  ON chat_tickets FOR SELECT
  TO anon
  USING (true);

-- Allow updating ticket status
CREATE POLICY "Allow updating tickets"
  ON chat_tickets FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_tickets_status ON chat_tickets(status);
CREATE INDEX IF NOT EXISTS idx_chat_tickets_urgency ON chat_tickets(urgency);
CREATE INDEX IF NOT EXISTS idx_chat_tickets_created ON chat_tickets(created_at DESC);
