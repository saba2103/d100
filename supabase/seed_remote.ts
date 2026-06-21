import { spawn } from "child_process";
import { articles } from "./seed_course";

async function run() {
  console.log("Seeding Phase 1 course articles via Supabase CLI query (Management API)...");

  let sql = "";
  for (const article of articles as any[]) {
    const tagsSql = `ARRAY[${(article.tags as string[]).map((t: string) => `'${t.replace(/'/g, "''")}'`).join(", ")}]`;
    const contentJson = JSON.stringify(article.content);
    
    const titleEscaped = article.title.replace(/'/g, "''");
    const slugEscaped = article.slug.replace(/'/g, "''");
    const contentEscaped = contentJson.replace(/'/g, "''");
    const coverImageEscaped = article.cover_image_url ? `'${article.cover_image_url.replace(/'/g, "''")}'` : 'NULL';
    
    sql += `
INSERT INTO course_articles (phase, lesson_number, title, slug, content, cover_image_url, estimated_read_minutes, tags, published, updated_at)
VALUES (
  ${article.phase},
  '${article.lesson_number}',
  '${titleEscaped}',
  '${slugEscaped}',
  '${contentEscaped}'::jsonb,
  ${coverImageEscaped},
  ${article.estimated_read_minutes},
  ${tagsSql},
  ${article.published},
  NOW()
)
ON CONFLICT (slug) DO UPDATE
SET
  phase = EXCLUDED.phase,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  cover_image_url = EXCLUDED.cover_image_url,
  estimated_read_minutes = EXCLUDED.estimated_read_minutes,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published,
  updated_at = NOW();
`;
  }

  // Execute the SQL using supabase db query --linked
  const child = spawn("supabase", ["db", "query", "--linked"], {
    stdio: ["pipe", "pipe", "pipe"]
  });

  let stdout = "";
  let stderr = "";

  child.stdout.on("data", data => {
    stdout += data.toString();
  });

  child.stderr.on("data", data => {
    stderr += data.toString();
  });

  child.stdin.write(sql);
  child.stdin.end();

  child.on("close", code => {
    if (code !== 0) {
      console.error("Failed to execute SQL seed:");
      console.error(stderr);
      process.exit(1);
    } else {
      console.log("SQL Seed executed successfully via CLI!");
      console.log(stdout);
    }
  });
}

run().catch(err => {
  console.error("Run failed:", err);
  process.exit(1);
});
