import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { COURSE_PHASES } from "@/lib/course";
import { ArticleReaderClient } from "./ArticleReaderClient";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const lesson = COURSE_PHASES.flatMap((p) => p.lessons).find((l) => l.slug === params.slug);
  return {
    title: lesson ? `Lesson ${lesson.lesson_number}: ${lesson.title} | D100` : "Course | D100",
    description: lesson ? `Read Lesson ${lesson.lesson_number} on D100` : "D100 educational guides",
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = params;

  // Find the lesson in static definitions to check metadata
  const lesson = COURSE_PHASES.flatMap((p) => p.lessons).find((l) => l.slug === slug);
  if (!lesson) {
    redirect("/course");
  }

  const supabase = createClient();

  // Query the article content
  const { data: article } = await supabase
    .from("course_articles")
    .select("*")
    .eq("slug", slug)
    .single();

  // Find next lesson for routing in footer
  const allLessons = COURSE_PHASES.flatMap((p) => p.lessons);
  const currentIdx = allLessons.findIndex((l) => l.slug === slug);
  const nextLesson =
    currentIdx !== -1 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  return (
    <ArticleReaderClient
      lesson={lesson}
      initialArticle={article}
      nextLesson={nextLesson}
    />
  );
}
