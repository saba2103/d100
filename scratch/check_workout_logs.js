import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function main() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Select all workout logs
  const { data, error } = await supabase
    .from("workout_logs")
    .select("id, user_id, logged_at, profile_tag, exercises")
    .order("logged_at", { ascending: false })
    .limit(10);

  console.log("RECENT WORKOUT LOGS:", JSON.stringify(data, null, 2));
  console.log("ERROR:", error);
}

main();
