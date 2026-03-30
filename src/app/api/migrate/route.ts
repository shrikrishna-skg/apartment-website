import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MIGRATION_COLUMNS = [
  // Personal
  { name: "gender", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS gender TEXT" },
  { name: "address_type", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS address_type TEXT" },
  // Education
  { name: "course_name", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS course_name TEXT" },
  { name: "course_start_date", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS course_start_date TEXT" },
  { name: "advisor_phone", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS advisor_phone TEXT" },
  { name: "advisor_email", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS advisor_email TEXT" },
  // Emergency Contact 2
  { name: "emergency_contact_email", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT" },
  { name: "emergency_contact2_name", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact2_name TEXT" },
  { name: "emergency_contact2_phone", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact2_phone TEXT" },
  { name: "emergency_contact2_email", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact2_email TEXT" },
  { name: "emergency_relationship2", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_relationship2 TEXT" },
  // Pets & Vehicle
  { name: "has_pets", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_pets BOOLEAN DEFAULT false" },
  { name: "pets", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS pets JSONB DEFAULT '[]'::jsonb" },
  { name: "has_vehicle", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_vehicle BOOLEAN DEFAULT false" },
  { name: "vehicle1_make", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_make TEXT" },
  { name: "vehicle1_year", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_year TEXT" },
  { name: "vehicle1_color", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_color TEXT" },
  { name: "vehicle1_plate", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS vehicle1_plate TEXT" },
  // Background Check
  { name: "filed_bankruptcy", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS filed_bankruptcy BOOLEAN DEFAULT false" },
  { name: "bankruptcy_details", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS bankruptcy_details TEXT" },
  { name: "evicted_from_tenancy", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS evicted_from_tenancy BOOLEAN DEFAULT false" },
  { name: "eviction_details", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS eviction_details TEXT" },
  { name: "convicted_felony", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS convicted_felony BOOLEAN DEFAULT false" },
  { name: "felony_details", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS felony_details TEXT" },
  { name: "arrested_or_convicted", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS arrested_or_convicted BOOLEAN DEFAULT false" },
  { name: "arrest_details", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS arrest_details TEXT" },
  // Authorization
  { name: "agree_terms", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS agree_terms BOOLEAN DEFAULT false" },
  { name: "signature_name", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS signature_name TEXT" },
  { name: "signature_date", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS signature_date TEXT" },
  { name: "consent_communications", sql: "ALTER TABLE applications ADD COLUMN IF NOT EXISTS consent_communications BOOLEAN DEFAULT false" },
];

export async function POST(request: NextRequest) {
  const { secret } = await request.json().catch(() => ({}));
  if (secret !== "run-migration-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
  }

  const supabase = createClient(url, key);
  const results: string[] = [];

  // ── AI Tables setup: check & report ──
  const AI_TABLES = [
    {
      name: "ai_knowledge_articles",
      sql: `CREATE TABLE IF NOT EXISTS ai_knowledge_articles (
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
      ); ALTER TABLE ai_knowledge_articles ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "Allow reading knowledge articles" ON ai_knowledge_articles FOR SELECT TO anon USING (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN
        CREATE POLICY "Allow inserting knowledge articles" ON ai_knowledge_articles FOR INSERT TO anon WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN
        CREATE POLICY "Allow updating knowledge articles" ON ai_knowledge_articles FOR UPDATE TO anon USING (true) WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    },
    {
      name: "ai_versions",
      sql: `CREATE TABLE IF NOT EXISTS ai_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        version_number INT NOT NULL,
        label TEXT NOT NULL,
        description TEXT,
        snapshot JSONB NOT NULL,
        article_count INT DEFAULT 0,
        total_token_estimate INT DEFAULT 0,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
        performance_score NUMERIC(3,2),
        created_by TEXT DEFAULT 'admin'
      ); ALTER TABLE ai_versions ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "Allow reading versions" ON ai_versions FOR SELECT TO anon USING (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN
        CREATE POLICY "Allow inserting versions" ON ai_versions FOR INSERT TO anon WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN
        CREATE POLICY "Allow updating versions" ON ai_versions FOR UPDATE TO anon USING (true) WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    },
    {
      name: "ai_conversations",
      sql: `CREATE TABLE IF NOT EXISTS ai_conversations (
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
      ); ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "Allow chatbot to insert conversations" ON ai_conversations FOR INSERT TO anon WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN
        CREATE POLICY "Allow reading conversations" ON ai_conversations FOR SELECT TO anon USING (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN
        CREATE POLICY "Allow updating conversations" ON ai_conversations FOR UPDATE TO anon USING (true) WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    },
    {
      name: "ai_settings",
      sql: `CREATE TABLE IF NOT EXISTS ai_settings (
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
      ); ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "Allow reading settings" ON ai_settings FOR SELECT TO anon USING (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN
        CREATE POLICY "Allow inserting settings" ON ai_settings FOR INSERT TO anon WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN
        CREATE POLICY "Allow updating settings" ON ai_settings FOR UPDATE TO anon USING (true) WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      INSERT INTO ai_settings (id) VALUES (1) ON CONFLICT DO NOTHING;`,
    },
    {
      name: "ai_suggested_articles",
      sql: `CREATE TABLE IF NOT EXISTS ai_suggested_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        suggested_title TEXT NOT NULL,
        suggested_content TEXT NOT NULL,
        reason TEXT NOT NULL,
        source_conversation_ids UUID[] DEFAULT '{}',
        frequency INT DEFAULT 1,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','dismissed')),
        approved_article_id UUID REFERENCES ai_knowledge_articles(id)
      ); ALTER TABLE ai_suggested_articles ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "Allow reading suggested articles" ON ai_suggested_articles FOR SELECT TO anon USING (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN
        CREATE POLICY "Allow inserting suggested articles" ON ai_suggested_articles FOR INSERT TO anon WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN
        CREATE POLICY "Allow updating suggested articles" ON ai_suggested_articles FOR UPDATE TO anon USING (true) WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    },
  ];

  // Step 1: Check exec_sql availability
  let hasExecSql = false;
  try {
    const { error: fnError } = await supabase.rpc("exec_sql", { query: "SELECT 1" });
    hasExecSql = !fnError || !fnError.message.includes("Could not find");
  } catch {
    hasExecSql = false;
  }

  // Step 2: AI Tables — check and create if exec_sql is available
  const aiResults: string[] = [];
  for (const table of AI_TABLES) {
    const { error: checkError } = await supabase
      .from(table.name)
      .select("id")
      .limit(1);

    if (checkError && (checkError.message.includes("does not exist") || checkError.code === "42P01")) {
      if (hasExecSql) {
        const { error: createError } = await supabase.rpc("exec_sql", { query: table.sql });
        aiResults.push(createError ? `AI TABLE ERROR: ${table.name} — ${createError.message}` : `AI TABLE CREATED: ${table.name}`);
      } else {
        aiResults.push(`AI TABLE MISSING: ${table.name}`);
      }
    } else {
      aiResults.push(`AI TABLE EXISTS: ${table.name}`);
    }
  }

  // Step 3: Application columns — check and optionally create
  if (!hasExecSql) {
    results.push("exec_sql function not available — checking columns instead");

    for (const col of MIGRATION_COLUMNS) {
      const { error } = await supabase
        .from("applications")
        .select(col.name)
        .limit(1);

      if (error && (error.message.includes("does not exist") || error.message.includes("schema cache"))) {
        results.push(`MISSING: ${col.name}`);
      } else {
        results.push(`EXISTS: ${col.name}`);
      }
    }

    const missingCols = results.filter((r) => r.startsWith("MISSING"));
    const missingAI = aiResults.filter((r) => r.includes("MISSING"));

    // Generate SQL for everything that needs to be run manually
    const sqlParts: string[] = [];
    if (missingCols.length > 0) {
      sqlParts.push("-- Application columns");
      sqlParts.push(...MIGRATION_COLUMNS
        .filter((c) => missingCols.some((m) => m.includes(c.name)))
        .map((c) => c.sql + ";"));
    }
    if (missingAI.length > 0) {
      sqlParts.push("\n-- AI Tables");
      sqlParts.push(...AI_TABLES
        .filter((t) => missingAI.some((m) => m.includes(t.name)))
        .map((t) => t.sql + ";"));
    }

    return NextResponse.json({
      status: (missingCols.length > 0 || missingAI.length > 0) ? "migration_needed" : "all_up_to_date",
      missingColumns: missingCols.length,
      missingAITables: missingAI.length,
      results: [...aiResults, ...results],
      sql: sqlParts.length > 0 ? sqlParts.join("\n") : null,
      instructions: sqlParts.length > 0
        ? "Copy the SQL below and run it in Supabase Dashboard → SQL Editor → New Query → Run"
        : "All tables and columns exist. No migration needed.",
    });
  }

  // exec_sql is available — run migrations directly
  for (const col of MIGRATION_COLUMNS) {
    try {
      const { error } = await supabase.rpc("exec_sql", { query: col.sql });
      results.push(error ? `ERROR: ${col.name} — ${error.message}` : `OK: ${col.name}`);
    } catch (err) {
      results.push(`FAILED: ${col.name} — ${err}`);
    }
  }

  return NextResponse.json({
    status: "migration_executed",
    results: [...aiResults, ...results],
  });
}
