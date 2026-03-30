-- AI Knowledge Base tables for the AI chatbot system
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query

-- ============================================================
-- 1. ai_knowledge_articles - Knowledge entries
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manual',
  source_url TEXT,
  priority INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT DEFAULT 'admin'
);

ALTER TABLE ai_knowledge_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reading knowledge articles"
  ON ai_knowledge_articles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow inserting knowledge articles"
  ON ai_knowledge_articles FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow updating knowledge articles"
  ON ai_knowledge_articles FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON ai_knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_is_active ON ai_knowledge_articles(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_tags ON ai_knowledge_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_created ON ai_knowledge_articles(created_at DESC);

-- ============================================================
-- 2. ai_versions - Version snapshots
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  version_number INT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  snapshot JSONB NOT NULL,
  article_count INT DEFAULT 0,
  total_token_estimate INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  performance_score NUMERIC(3,2),
  created_by TEXT DEFAULT 'admin'
);

ALTER TABLE ai_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reading versions"
  ON ai_versions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow inserting versions"
  ON ai_versions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow updating versions"
  ON ai_versions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Only one version can be active at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_versions_single_active
  ON ai_versions(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_versions_created ON ai_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_status ON ai_versions(status);

-- ============================================================
-- 3. ai_conversations - Chat session storage
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT NOT NULL,
  messages JSONB NOT NULL,
  message_count INT DEFAULT 0,
  ended_at TIMESTAMPTZ,
  created_ticket BOOLEAN DEFAULT false,
  ticket_id TEXT,
  visitor_type TEXT,
  topics TEXT[] DEFAULT '{}',
  sentiment TEXT,
  unanswered_questions TEXT[] DEFAULT '{}',
  ai_version_id UUID REFERENCES ai_versions(id)
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Only INSERT for anon (public chat stores conversations)
CREATE POLICY "Allow chatbot to insert conversations"
  ON ai_conversations FOR INSERT
  TO anon
  WITH CHECK (true);

-- Staff dashboard reads via service role; add SELECT for anon so dashboard works with anon key
CREATE POLICY "Allow reading conversations"
  ON ai_conversations FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow updating conversations"
  ON ai_conversations FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON ai_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_topics ON ai_conversations USING GIN(topics);

-- ============================================================
-- 4. ai_settings - Singleton config (single row, id always 1)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  active_version_id UUID REFERENCES ai_versions(id),
  model_name TEXT DEFAULT 'llama-3.3-70b-versatile',
  temperature NUMERIC(3,2) DEFAULT 0.55,
  max_tokens INT DEFAULT 700,
  store_conversations BOOLEAN DEFAULT true,
  auto_analyze_conversations BOOLEAN DEFAULT false,
  website_sync_enabled BOOLEAN DEFAULT false,
  website_sync_urls TEXT[] DEFAULT '{}',
  last_website_sync TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reading settings"
  ON ai_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow inserting settings"
  ON ai_settings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow updating settings"
  ON ai_settings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Insert default row
INSERT INTO ai_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. ai_suggested_articles - Conversation-derived suggestions
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_suggested_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  suggested_title TEXT NOT NULL,
  suggested_content TEXT NOT NULL,
  reason TEXT NOT NULL,
  source_conversation_ids UUID[] DEFAULT '{}',
  frequency INT DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'dismissed')),
  approved_article_id UUID REFERENCES ai_knowledge_articles(id)
);

ALTER TABLE ai_suggested_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reading suggested articles"
  ON ai_suggested_articles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow inserting suggested articles"
  ON ai_suggested_articles FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow updating suggested articles"
  ON ai_suggested_articles FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_suggested_articles_status ON ai_suggested_articles(status);
CREATE INDEX IF NOT EXISTS idx_suggested_articles_created ON ai_suggested_articles(created_at DESC);
