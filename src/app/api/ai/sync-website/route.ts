import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

function stripHtml(html: string): string {
  // Remove script and style tags with their content
  let text = html.replace(
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    ""
  );
  text = text.replace(
    /<style[^>]*>[\s\S]*?<\/style>/gi,
    ""
  );
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) return stripHtml(titleMatch[1]);
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) return stripHtml(h1Match[1]);
  return "Untitled Page";
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    let urls: string[] = body.urls ?? [];

    // If no URLs provided, use ai_settings.website_sync_urls
    if (!urls.length) {
      const { data: settings } = await supabase
        .from("ai_settings")
        .select("website_sync_urls")
        .limit(1)
        .single();

      if (settings?.website_sync_urls && Array.isArray(settings.website_sync_urls)) {
        urls = settings.website_sync_urls;
      }
    }

    if (!urls.length) {
      return NextResponse.json(
        { error: "No URLs provided and none configured in settings" },
        { status: 400 }
      );
    }

    const syncedArticles: Array<Record<string, unknown>> = [];

    for (const url of urls) {
      try {
        // Fetch the page HTML server-side
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "CollegePlaceBot/1.0 (AI Knowledge Sync)",
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          console.error(`[sync-website] Failed to fetch ${url}: ${response.status}`);
          continue;
        }

        const html = await response.text();
        const title = extractTitle(html);
        const content = stripHtml(html);

        if (!content || content.length < 50) {
          continue;
        }

        // Truncate content to a reasonable size
        const truncatedContent = content.slice(0, 10000);

        // Upsert article with source='website-sync'
        const { data, error } = await supabase
          .from("ai_knowledge_articles")
          .upsert(
            {
              source: "website-sync",
              source_url: url,
              category: "website-content",
              title,
              content: truncatedContent,
              tags: ["auto-synced"],
              is_active: true,
              priority: 0,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "source_url" }
          )
          .select()
          .single();

        if (error) {
          console.error(`[sync-website] Upsert error for ${url}:`, error.message);
          continue;
        }

        if (data) {
          syncedArticles.push(data);
        }
      } catch (err) {
        console.error(`[sync-website] Error processing ${url}:`, err);
        continue;
      }
    }

    // Update last_website_sync in ai_settings
    await supabase
      .from("ai_settings")
      .update({
        last_website_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .not("id", "is", null);

    return NextResponse.json({
      synced: syncedArticles.length,
      articles: syncedArticles,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to sync website content" },
      { status: 500 }
    );
  }
}
