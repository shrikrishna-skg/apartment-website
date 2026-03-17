import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client — used exclusively in API routes, never exposed to browser.
// Falls back to NEXT_PUBLIC_ vars for backward compatibility.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During build time, env vars may not be available.
// Create a lazy client that only throws at runtime if actually used without config.
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)."
    );
  }

  _supabase = createClient(supabaseUrl, supabaseKey);
  return _supabase;
}

// Export a proxy that lazily initializes the client on first use
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
