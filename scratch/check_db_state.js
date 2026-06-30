import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function main() {
  console.log("Supabase URL:", supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Query total count of all tables
  const tables = ["workout_logs", "profiles", "user_settings", "daily_stats", "supplement_logs"];
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    console.log(`Table ${table} row count:`, count, "Error:", error);
  }
}

main();
