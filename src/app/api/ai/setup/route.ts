import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase credentials not configured");
  return createClient(url, key);
}

// GET — lightweight table check (called by dashboard on load)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const tables = ["ai_knowledge_articles", "ai_versions", "ai_conversations", "ai_settings", "ai_suggested_articles"];
  const status: Record<string, boolean> = {};

  for (const table of tables) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      const msg = error.message?.toLowerCase() || "";
      const missing = error.code === "42P01" || error.code === "PGRST204" || msg.includes("does not exist") || msg.includes("schema cache") || msg.includes("could not find");
      status[table] = !missing;
    } else {
      status[table] = true;
    }
  }

  const allExist = Object.values(status).every(Boolean);

  return NextResponse.json({ allExist, tables: status });
}

// POST — seed data when tables exist but are empty (auto-called by dashboard)
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const results: string[] = [];

  try {
    // 1. Check if tables exist
    const { error: tableCheck } = await supabase.from("ai_knowledge_articles").select("id").limit(1);
    const tcMsg = tableCheck?.message?.toLowerCase() || "";
    const tablesMissing = tableCheck && (tableCheck.code === "42P01" || tableCheck.code === "PGRST204" || tcMsg.includes("does not exist") || tcMsg.includes("schema cache") || tcMsg.includes("could not find"));
    if (tablesMissing) {
      return NextResponse.json({
        status: "tables_missing",
        message: "AI tables need to be created. Run the SQL from supabase/ai-knowledge-base-setup.sql in Supabase Dashboard → SQL Editor.",
        results: ["Tables not found — manual SQL execution required"],
      });
    }

    // 2. Ensure ai_settings default row exists
    const { data: settingsData } = await supabase
      .from("ai_settings")
      .select("id")
      .eq("id", 1)
      .single();

    if (!settingsData) {
      const { error: insertErr } = await supabase.from("ai_settings").insert({ id: 1 });
      results.push(insertErr ? `Settings row error: ${insertErr.message}` : "Created default ai_settings row");
    } else {
      results.push("ai_settings row exists");
    }

    // 3. Seed articles if empty
    const { data: existingArticles } = await supabase
      .from("ai_knowledge_articles")
      .select("id")
      .limit(1);

    if (!existingArticles || existingArticles.length === 0) {
      const seedArticles = [
        {
          category: "property",
          title: "College Place Apartments",
          content: "1002 Old Lascassas Rd, Murfreesboro, TN 37130. NEWEST property. 2BR/2BA: $700/room, Studio: $700/mo, Big Studio: $800/mo, 1BR: $900/mo. Amenities: Floor Laundry, Modern Appliances, High-Speed Internet, Pet Friendly, Volleyball Court, Study Lounge. Close to MTSU campus.",
          tags: ["college-place", "newest", "pricing"],
          priority: 10,
          source: "manual",
        },
        {
          category: "property",
          title: "College Center Apartments",
          content: "1023 Old Lascassas Rd, Murfreesboro, TN 37130. MOST AFFORDABLE property. 2BR/2BA: $550/room, 4BR/4BA: $500/room (cheapest option). Amenities: In-Unit Laundry, Free Parking, Pet Friendly, Study Area. Great value near campus.",
          tags: ["college-center", "affordable", "pricing"],
          priority: 9,
          source: "manual",
        },
        {
          category: "property",
          title: "College Pointe",
          content: "915 Brown Dr, Murfreesboro, TN 37130. 2BR/1BA: $600/room. Cozy property with convenient location.",
          tags: ["college-pointe", "pricing"],
          priority: 8,
          source: "manual",
        },
        {
          category: "property",
          title: "University Center",
          content: "1030 Greenland Dr, Murfreesboro, TN 37130. 2BR/2BA: $600/room. Prime location right on Greenland Drive near MTSU.",
          tags: ["university-center", "pricing"],
          priority: 8,
          source: "manual",
        },
        {
          category: "policy",
          title: "Leasing & Individual Leases",
          content: "Individual leasing available — you pay only for YOUR room. Lease terms: 6, 9, 12, or 18 months. Application at collegeplace.us/apply. Application process takes about 15-20 minutes.",
          tags: ["leasing", "individual", "terms"],
          priority: 7,
          source: "manual",
        },
        {
          category: "policy",
          title: "Pet Policy",
          content: "Pets are welcome! $200 one-time pet deposit + $25/month pet rent. ESA (Emotional Support Animals) have no fees with proper documentation. Breed restrictions may apply — contact office for details.",
          tags: ["pets", "esa", "policy"],
          priority: 6,
          source: "manual",
        },
        {
          category: "policy",
          title: "Utilities",
          content: "Utilities are $100/person/month flat rate. This covers water, high-speed internet, and trash pickup. Electricity is typically separate and billed by the utility company.",
          tags: ["utilities", "pricing", "bills"],
          priority: 6,
          source: "manual",
        },
        {
          category: "process",
          title: "Applications & Tours",
          content: "Apply online at collegeplace.us/apply. Three application types: Student, International Student, Working Professional/General. Schedule a tour at /schedule-tour. Virtual 3D tours (Matterport) available on the website. Office open Mon-Sat 9am-5pm, Sunday Closed.",
          tags: ["application", "tours", "virtual"],
          priority: 7,
          source: "manual",
        },
        {
          category: "location",
          title: "Address & Contact Info",
          content: "Main Office: 1002 Old Lascassas Rd, Murfreesboro, TN 37130. Phone: (615) 900-0166. Email: office@collegeplace.us. Office Hours: Monday-Saturday 9am-5pm, Sunday Closed.",
          tags: ["contact", "address", "hours"],
          priority: 10,
          source: "manual",
        },
        {
          category: "location",
          title: "MTSU Campus Proximity",
          content: "College Place Apartments is just 0.4 miles from MTSU campus — about an 8-minute walk or 2-minute drive. The closest apartments to Middle Tennessee State University in Murfreesboro.",
          tags: ["mtsu", "location", "campus"],
          priority: 9,
          source: "manual",
        },
      ];

      const { error: seedErr } = await supabase
        .from("ai_knowledge_articles")
        .insert(seedArticles);

      results.push(seedErr ? `Seed articles error: ${seedErr.message}` : "Seeded 10 initial knowledge articles");
    } else {
      results.push("Articles already exist, skipping seed");
    }

    // 4. Create initial version if none exists
    const { data: existingVersions } = await supabase
      .from("ai_versions")
      .select("id")
      .limit(1);

    if (!existingVersions || existingVersions.length === 0) {
      const { data: allArticles } = await supabase
        .from("ai_knowledge_articles")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false });

      if (allArticles && allArticles.length > 0) {
        const snapshot = {
          articles: allArticles,
          article_ids: allArticles.map((a: { id: string }) => a.id),
        };
        const tokenEstimate = Math.ceil(
          allArticles.map((a: { content: string }) => a.content).join(" ").length / 4
        );

        const { data: version, error: vErr } = await supabase
          .from("ai_versions")
          .insert({
            version_number: 1,
            label: "Initial Release",
            description: "First version with property info, pricing, policies, and contact details.",
            snapshot,
            article_count: allArticles.length,
            total_token_estimate: tokenEstimate,
            status: "active",
          })
          .select()
          .single();

        if (vErr) {
          results.push(`Version creation error: ${vErr.message}`);
        } else if (version) {
          await supabase
            .from("ai_settings")
            .update({ active_version_id: version.id })
            .eq("id", 1);
          results.push(`Created and activated Version 1 (${allArticles.length} articles, ~${tokenEstimate} tokens)`);
        }
      }
    } else {
      results.push("Version already exists, skipping");
    }

    return NextResponse.json({ status: "success", results });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
      results,
    }, { status: 500 });
  }
}
