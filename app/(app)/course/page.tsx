import { createClient } from "@/lib/supabase/server";
import { COURSE_PHASES } from "@/lib/course";
import { CourseClient } from "./CourseClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course | D100",
  description: "D100 educational articles and guides.",
};

export default async function CoursePage() {
  const supabase = createClient();

  // Fetch published slugs from the database to dynamically confirm availability
  const { data: dbArticles } = await supabase
    .from("course_articles")
    .select("slug, published");

  const publishedSlugs = new Set<string>(
    (dbArticles || [])
      .filter((a) => a.published)
      .map((a) => a.slug)
  );

  return (
    <CourseClient
      phases={COURSE_PHASES}
      publishedSlugs={Array.from(publishedSlugs)}
    />
  );
}
