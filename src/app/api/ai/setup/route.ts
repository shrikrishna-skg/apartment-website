import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  // Check for setup secret
  const { secret } = await req.json();
  if (secret !== "setup-ai-knowledge-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Create tables using raw SQL via supabase-js rpc
    // Since we can't run raw SQL directly, we'll create tables via the REST API
    // by inserting data and letting the tables be auto-created...
    // Actually, let's just try each table creation

    // Table 1: ai_knowledge_articles
    const { error: e1 } = await supabaseAdmin.from("ai_knowledge_articles").select("id").limit(1);
    if (e1 && e1.code === "42P01") {
      results.push("ai_knowledge_articles needs creation");
    } else {
      results.push("ai_knowledge_articles exists");
    }

    // Table 2: ai_versions
    const { error: e2 } = await supabaseAdmin.from("ai_versions").select("id").limit(1);
    if (e2 && e2.code === "42P01") {
      results.push("ai_versions needs creation");
    } else {
      results.push("ai_versions exists");
    }

    // Table 3: ai_conversations
    const { error: e3 } = await supabaseAdmin.from("ai_conversations").select("id").limit(1);
    if (e3 && e3.code === "42P01") {
      results.push("ai_conversations needs creation");
    } else {
      results.push("ai_conversations exists");
    }

    // Table 4: ai_settings
    const { error: e4 } = await supabaseAdmin.from("ai_settings").select("id").limit(1);
    if (e4 && e4.code === "42P01") {
      results.push("ai_settings needs creation");
    } else {
      results.push("ai_settings exists");
    }

    // Table 5: ai_suggested_articles
    const { error: e5 } = await supabaseAdmin.from("ai_suggested_articles").select("id").limit(1);
    if (e5 && e5.code === "42P01") {
      results.push("ai_suggested_articles needs creation");
    } else {
      results.push("ai_suggested_articles exists");
    }

    // If tables need creation, the user must run the SQL in Supabase Dashboard
    const needsCreation = results.filter(r => r.includes("needs creation"));
    if (needsCreation.length > 0) {
      return NextResponse.json({
        status: "tables_needed",
        message: "Run the SQL in supabase/ai-knowledge-base-setup.sql via Supabase Dashboard SQL Editor",
        results,
      });
    }

    // Seed initial knowledge articles if empty
    const { data: existingArticles } = await supabaseAdmin
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
          content: "Main Office: 1023 Old Lascassas Rd, Murfreesboro, TN 37130. Phone: (615) 200-0620. Email: office@collegeplace.us. Office Hours: Monday-Saturday 9am-5pm, Sunday Closed.",
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

      const { error: seedErr } = await supabaseAdmin
        .from("ai_knowledge_articles")
        .insert(seedArticles);

      if (seedErr) {
        results.push(`Seed articles error: ${seedErr.message}`);
      } else {
        results.push("Seeded 10 initial knowledge articles");
      }
    } else {
      results.push("Articles already exist, skipping seed");
    }

    // Ensure ai_settings has a default row
    const { data: settingsData } = await supabaseAdmin
      .from("ai_settings")
      .select("id")
      .eq("id", 1)
      .single();

    if (!settingsData) {
      await supabaseAdmin.from("ai_settings").insert({ id: 1 });
      results.push("Created default ai_settings row");
    } else {
      results.push("ai_settings row exists");
    }

    // Create version 1 from seed articles
    const { data: allArticles } = await supabaseAdmin
      .from("ai_knowledge_articles")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false });

    const { data: existingVersions } = await supabaseAdmin
      .from("ai_versions")
      .select("id")
      .limit(1);

    if ((!existingVersions || existingVersions.length === 0) && allArticles && allArticles.length > 0) {
      const snapshot = {
        articles: allArticles,
        article_ids: allArticles.map((a: { id: string }) => a.id),
      };
      const tokenEstimate = Math.ceil(JSON.stringify(allArticles.map((a: { content: string }) => a.content).join(" ")).length / 4);

      const { data: version, error: vErr } = await supabaseAdmin
        .from("ai_versions")
        .insert({
          version_number: 1,
          label: "Initial Release",
          description: "First version with all property information, pricing, policies, and contact details from the original system prompt.",
          snapshot,
          article_count: allArticles.length,
          total_token_estimate: tokenEstimate,
          status: "active",
        })
        .select()
        .single();

      if (vErr) {
        results.push(`Version creation error: ${vErr.message}`);
      } else {
        // Set as active version in settings
        await supabaseAdmin
          .from("ai_settings")
          .update({ active_version_id: version.id })
          .eq("id", 1);
        results.push(`Created and activated Version 1 (${allArticles.length} articles, ~${tokenEstimate} tokens)`);
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
