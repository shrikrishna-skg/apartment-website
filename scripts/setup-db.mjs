#!/usr/bin/env node
/**
 * Database setup script for College Place Apartments
 *
 * Usage:
 *   node scripts/setup-db.mjs <your-database-password>
 *
 * Or set the DATABASE_URL environment variable:
 *   DATABASE_URL=postgresql://postgres:PASSWORD@db.wcirkgqhuubhthonsora.supabase.co:5432/postgres node scripts/setup-db.mjs
 */

import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const password = process.argv[2];
const databaseUrl =
  process.env.DATABASE_URL ||
  (password
    ? `postgresql://postgres:${encodeURIComponent(password)}@db.wcirkgqhuubhthonsora.supabase.co:5432/postgres`
    : null);

if (!databaseUrl) {
  console.error("Usage: node scripts/setup-db.mjs <your-database-password>");
  console.error("  Or set DATABASE_URL environment variable");
  process.exit(1);
}

const sql = readFileSync(join(__dirname, "..", "supabase", "schema.sql"), "utf8");

async function main() {
  console.log("Connecting to Supabase database...");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected! Running entire schema as single transaction...\n");

    await client.query(sql);

    console.log("✅ Database setup complete!");

    // Verify tables exist
    const { rows } = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log("\nTables in public schema:");
    for (const row of rows) {
      console.log(`  • ${row.tablename}`);
    }
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
