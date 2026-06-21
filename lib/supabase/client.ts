import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";

/**
 * Creates a typed Supabase client for use in Client Components.
 * Call this function inside a component — do NOT call it at module level.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
