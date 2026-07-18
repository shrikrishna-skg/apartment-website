import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendRotationArticle } from "@/lib/email";
import { BLOG_POSTS } from "@/data/site-data";

// Allow a longer run so a batch of emails can go out within one invocation.
export const maxDuration = 60;

// Max emails per run. Keep under the Gmail daily cap (~500 regular, ~2000
// Workspace). Tunable via env without a code change.
const BATCH = Number(process.env.NEWSLETTER_BATCH || 100);
// Don't email the same subscriber more than once a week.
const MIN_DAYS_BETWEEN = 6;

/**
 * Weekly rotation: send each active subscriber the next Student Life Hub
 * article they haven't received yet. Triggered by a Vercel Cron Job.
 */
export async function GET(req: NextRequest) {
  // Only Vercel Cron (or a caller with the secret) may trigger a send.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - MIN_DAYS_BETWEEN * 86_400_000).toISOString();

  // Active subscribers due for their next article
  const { data: subs, error } = await supabase
    .from("email_subscribers")
    .select("id, email, unsubscribe_token, sent_slugs, last_sent_at")
    .eq("subscribed", true)
    .is("deleted_at", null)
    .is("unsubscribed_at", null)
    .or(`last_sent_at.is.null,last_sent_at.lt.${cutoff}`)
    .limit(BATCH);

  if (error) {
    console.error("[newsletter/rotate] query failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allSlugs = BLOG_POSTS.map((p) => p.slug);
  let sent = 0;
  let completedAll = 0;
  let skipped = 0;

  for (const sub of subs ?? []) {
    const already: string[] = sub.sent_slugs ?? [];
    const nextSlug = allSlugs.find((s) => !already.includes(s));
    if (!nextSlug) {
      completedAll++; // this subscriber has received every article
      continue;
    }
    const post = BLOG_POSTS.find((p) => p.slug === nextSlug);
    if (!post) {
      skipped++;
      continue;
    }

    const ok = await sendRotationArticle(sub.email, sub.unsubscribe_token ?? null, post);
    if (!ok) {
      skipped++; // e.g. SMTP not configured — leave state unchanged, retry next run
      continue;
    }

    await supabase
      .from("email_subscribers")
      .update({
        sent_slugs: [...already, nextSlug],
        last_sent_at: new Date().toISOString(),
      })
      .eq("id", sub.id);
    sent++;
  }

  const summary = { processed: subs?.length ?? 0, sent, completedAll, skipped };
  console.log("[newsletter/rotate]", JSON.stringify(summary));
  return NextResponse.json({ ok: true, ...summary });
}
