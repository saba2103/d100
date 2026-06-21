// =============================================================================
// D100 — Supabase Database Types
// Auto-aligned with: supabase/migrations/20260620000000_initial_schema.sql
// =============================================================================

// ── JSON Primitives ────────────────────────────────────────────────────────
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

// ── JSONB Payload Shapes ───────────────────────────────────────────────────

/** One set within an exercise */
export interface ExerciseSet {
  reps: number;
  weight_kg?: number;
  completed: boolean;
}

/** One exercise entry inside workout_logs.exercises */
export interface ExerciseEntry {
  name: string;
  sets: ExerciseSet[];
}

/** One food item inside nutrition_logs.items */
export interface NutritionItem {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  quantity: number;
  unit: string;
}

/** One supplement taken */
export interface SupplementEntry {
  name: string;
  dose: string;
  taken_at?: string; // ISO time string
}

/** Scale measurement flags */
export interface MeasurementFlags {
  bmi?: "Low" | "Standard" | "High";
  body_fat?: "Low" | "Standard" | "High";
  skeletal_muscle?: "Low" | "Standard" | "High";
  protein?: "Low" | "Standard" | "High";
  body_water?: "Low" | "Standard" | "High";
  [key: string]: string | undefined;
}

/** Course article rich content block */
export type ContentBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "text"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "image"; url: string; caption?: string; alt?: string }
  | { type: "callout"; variant: "info" | "tip" | "warning"; text: string }
  | { type: "divider" };

/** Collection item metadata */
export interface CollectionMetadata {
  width?: number;
  height?: number;
  page_count?: number;
  extracted_stats?: Record<string, string | number>;
  [key: string]: Json | undefined;
}

// =============================================================================
// DATABASE SCHEMA TYPES
// Each table must include Relationships: [] to satisfy @supabase/supabase-js
// GenericTable constraint.
// =============================================================================

export interface Database {
  public: {
    Tables: {
      // ── profiles ────────────────────────────────────────────────
      profiles: {
        Row: {
          id: string;
          display_name: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          height_cm: number | null;
          starting_weight_kg: number | null;
          date_of_birth: string | null;
          gender: "male" | "female" | "other" | null;
          program_start_date: string | null;
          avatar_url: string | null;
          current_weight_goal_kg: number | null;
          target_body_fat_pct: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          height_cm?: number | null;
          starting_weight_kg?: number | null;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | null;
          program_start_date?: string | null;
          avatar_url?: string | null;
          current_weight_goal_kg?: number | null;
          target_body_fat_pct?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          height_cm?: number | null;
          starting_weight_kg?: number | null;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | null;
          program_start_date?: string | null;
          avatar_url?: string | null;
          current_weight_goal_kg?: number | null;
          target_body_fat_pct?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── workout_logs ─────────────────────────────────────────────
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          phase: number;
          exercises: ExerciseEntry[];
          duration_minutes: number | null;
          notes: string | null;
          profile_tag: "S" | "A";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          phase?: number;
          exercises?: ExerciseEntry[];
          duration_minutes?: number | null;
          notes?: string | null;
          profile_tag?: "S" | "A";
          created_at?: string;
        };
        Update: {
          logged_at?: string;
          phase?: number;
          exercises?: ExerciseEntry[];
          duration_minutes?: number | null;
          notes?: string | null;
          profile_tag?: "S" | "A";
        };
        Relationships: [];
      };

      // ── nutrition_logs ───────────────────────────────────────────
      nutrition_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          meal_type:
            | "breakfast"
            | "lunch"
            | "dinner"
            | "snack"
            | "pre_workout"
            | "post_workout"
            | null;
          items: NutritionItem[];
          notes: string | null;
          profile_tag: "S" | "A";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          meal_type?:
            | "breakfast"
            | "lunch"
            | "dinner"
            | "snack"
            | "pre_workout"
            | "post_workout"
            | null;
          items?: NutritionItem[];
          notes?: string | null;
          profile_tag?: "S" | "A";
          created_at?: string;
        };
        Update: {
          logged_at?: string;
          meal_type?:
            | "breakfast"
            | "lunch"
            | "dinner"
            | "snack"
            | "pre_workout"
            | "post_workout"
            | null;
          items?: NutritionItem[];
          notes?: string | null;
          profile_tag?: "S" | "A";
        };
        Relationships: [];
      };

      // ── daily_stats ───────────────────────────────────────────────
      daily_stats: {
        Row: {
          id: string;
          user_id: string;
          stat_date: string;
          water_ml: number;
          water_goal_ml: number;
          steps: number;
          steps_goal: number;
          calories_consumed: number;
          calories_burned: number;
          calories_goal: number;
          profile_tag: "S" | "A";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stat_date?: string;
          water_ml?: number;
          water_goal_ml?: number;
          steps?: number;
          steps_goal?: number;
          calories_consumed?: number;
          calories_burned?: number;
          calories_goal?: number;
          profile_tag?: "S" | "A";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          water_ml?: number;
          water_goal_ml?: number;
          steps?: number;
          steps_goal?: number;
          calories_consumed?: number;
          calories_burned?: number;
          calories_goal?: number;
          profile_tag?: "S" | "A";
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── body_measurements ─────────────────────────────────────────
      body_measurements: {
        Row: {
          id: string;
          user_id: string;
          measured_at: string;
          source: "manual" | "cult_scale" | "import";
          weight_kg: number | null;
          bmi: number | null;
          body_fat_pct: number | null;
          body_fat_kg: number | null;
          lean_mass_kg: number | null;
          bone_mass_kg: number | null;
          skeletal_muscle_mass_kg: number | null;
          skeletal_muscle_pct: number | null;
          subcutaneous_fat_pct: number | null;
          visceral_fat_level: number | null;
          protein_pct: number | null;
          body_water_pct: number | null;
          bmr_kcal: number | null;
          metabolic_age: number | null;
          flags: MeasurementFlags;
          notes: string | null;
          profile_tag: "S" | "A";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          measured_at?: string;
          source?: "manual" | "cult_scale" | "import";
          weight_kg?: number | null;
          bmi?: number | null;
          body_fat_pct?: number | null;
          body_fat_kg?: number | null;
          lean_mass_kg?: number | null;
          bone_mass_kg?: number | null;
          skeletal_muscle_mass_kg?: number | null;
          skeletal_muscle_pct?: number | null;
          subcutaneous_fat_pct?: number | null;
          visceral_fat_level?: number | null;
          protein_pct?: number | null;
          body_water_pct?: number | null;
          bmr_kcal?: number | null;
          metabolic_age?: number | null;
          flags?: MeasurementFlags;
          notes?: string | null;
          profile_tag?: "S" | "A";
          created_at?: string;
        };
        Update: {
          measured_at?: string;
          source?: "manual" | "cult_scale" | "import";
          weight_kg?: number | null;
          bmi?: number | null;
          body_fat_pct?: number | null;
          body_fat_kg?: number | null;
          lean_mass_kg?: number | null;
          bone_mass_kg?: number | null;
          skeletal_muscle_mass_kg?: number | null;
          skeletal_muscle_pct?: number | null;
          subcutaneous_fat_pct?: number | null;
          visceral_fat_level?: number | null;
          protein_pct?: number | null;
          body_water_pct?: number | null;
          bmr_kcal?: number | null;
          metabolic_age?: number | null;
          flags?: MeasurementFlags;
          notes?: string | null;
          profile_tag?: "S" | "A";
        };
        Relationships: [];
      };

      // ── supplement_logs ───────────────────────────────────────────
      supplement_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          supplements: SupplementEntry[];
          profile_tag: "S" | "A";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          supplements?: SupplementEntry[];
          profile_tag?: "S" | "A";
          created_at?: string;
        };
        Update: {
          logged_at?: string;
          supplements?: SupplementEntry[];
          profile_tag?: "S" | "A";
        };
        Relationships: [];
      };

      // ── user_badges ───────────────────────────────────────────────
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          profile_tag: "S" | "A";
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          profile_tag?: "S" | "A";
          earned_at?: string;
        };
        Update: {
          earned_at?: string;
          profile_tag?: "S" | "A";
        };
        Relationships: [];
      };

      // ── collection_items ──────────────────────────────────────────
      collection_items: {
        Row: {
          id: string;
          user_id: string;
          profile_tag: "S" | "A" | "both" | null;
          title: string | null;
          file_url: string;
          file_type: "photo" | "pdf" | "screenshot" | "report" | "other";
          album: string | null;
          file_size_bytes: number | null;
          mime_type: string | null;
          metadata: CollectionMetadata;
          taken_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_tag?: "S" | "A" | "both" | null;
          title?: string | null;
          file_url: string;
          file_type: "photo" | "pdf" | "screenshot" | "report" | "other";
          album?: string | null;
          file_size_bytes?: number | null;
          mime_type?: string | null;
          metadata?: CollectionMetadata;
          taken_at?: string | null;
          created_at?: string;
        };
        Update: {
          profile_tag?: "S" | "A" | "both" | null;
          title?: string | null;
          file_url?: string;
          file_type?: "photo" | "pdf" | "screenshot" | "report" | "other";
          album?: string | null;
          file_size_bytes?: number | null;
          mime_type?: string | null;
          metadata?: CollectionMetadata;
          taken_at?: string | null;
        };
        Relationships: [];
      };

      // ── course_articles ───────────────────────────────────────────
      course_articles: {
        Row: {
          id: string;
          phase: number;
          lesson_number: string;
          title: string;
          slug: string;
          content: ContentBlock[];
          cover_image_url: string | null;
          estimated_read_minutes: number | null;
          tags: string[];
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phase?: number;
          lesson_number: string;
          title: string;
          slug: string;
          content?: ContentBlock[];
          cover_image_url?: string | null;
          estimated_read_minutes?: number | null;
          tags?: string[];
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          phase?: number;
          lesson_number?: string;
          title?: string;
          slug?: string;
          content?: ContentBlock[];
          cover_image_url?: string | null;
          estimated_read_minutes?: number | null;
          tags?: string[];
          published?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── user_settings ─────────────────────────────────────────────
      user_settings: {
        Row: {
          user_id: string;
          theme: "dark" | "light" | "system";
          ai_provider: "openai" | "anthropic";
          ai_api_key_encrypted: string | null;
          water_goal_ml: number;
          steps_goal: number;
          calories_goal: number;
          active_profile: "S" | "A";
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: "dark" | "light" | "system";
          ai_provider?: "openai" | "anthropic";
          ai_api_key_encrypted?: string | null;
          water_goal_ml?: number;
          steps_goal?: number;
          calories_goal?: number;
          active_profile?: "S" | "A";
          updated_at?: string;
        };
        Update: {
          theme?: "dark" | "light" | "system";
          ai_provider?: "openai" | "anthropic";
          ai_api_key_encrypted?: string | null;
          water_goal_ml?: number;
          steps_goal?: number;
          calories_goal?: number;
          active_profile?: "S" | "A";
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── member_profiles ──────────────────────────────────────────────
      member_profiles: {
        Row: {
          user_id: string;
          profile_tag: "S" | "A";
          full_name: string | null;
          phone: string | null;
          height_cm: number | null;
          starting_weight_kg: number | null;
          date_of_birth: string | null;
          gender: "male" | "female" | "other" | null;
          avatar_url: string | null;
          program_start_date: string | null;
          current_weight_goal_kg: number | null;
          target_body_fat_pct: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          profile_tag: "S" | "A";
          full_name?: string | null;
          phone?: string | null;
          height_cm?: number | null;
          starting_weight_kg?: number | null;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | null;
          avatar_url?: string | null;
          program_start_date?: string | null;
          current_weight_goal_kg?: number | null;
          target_body_fat_pct?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          height_cm?: number | null;
          starting_weight_kg?: number | null;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | null;
          avatar_url?: string | null;
          program_start_date?: string | null;
          current_weight_goal_kg?: number | null;
          target_body_fat_pct?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };

    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
  };
}

// =============================================================================
// CONVENIENCE TYPE ALIASES
// =============================================================================
type Tables = Database["public"]["Tables"];

export type Profile          = Tables["profiles"]["Row"];
export type ProfileInsert    = Tables["profiles"]["Insert"];
export type ProfileUpdate    = Tables["profiles"]["Update"];

export type WorkoutLog       = Tables["workout_logs"]["Row"];
export type WorkoutLogInsert = Tables["workout_logs"]["Insert"];
export type WorkoutLogUpdate = Tables["workout_logs"]["Update"];

export type NutritionLog       = Tables["nutrition_logs"]["Row"];
export type NutritionLogInsert = Tables["nutrition_logs"]["Insert"];
export type NutritionLogUpdate = Tables["nutrition_logs"]["Update"];

export type DailyStats       = Tables["daily_stats"]["Row"];
export type DailyStatsInsert = Tables["daily_stats"]["Insert"];
export type DailyStatsUpdate = Tables["daily_stats"]["Update"];

export type BodyMeasurement       = Tables["body_measurements"]["Row"];
export type BodyMeasurementInsert = Tables["body_measurements"]["Insert"];
export type BodyMeasurementUpdate = Tables["body_measurements"]["Update"];

export type SupplementLog       = Tables["supplement_logs"]["Row"];
export type SupplementLogInsert = Tables["supplement_logs"]["Insert"];
export type SupplementLogUpdate = Tables["supplement_logs"]["Update"];

export type UserBadge       = Tables["user_badges"]["Row"];
export type UserBadgeInsert = Tables["user_badges"]["Insert"];

export type CollectionItem       = Tables["collection_items"]["Row"];
export type CollectionItemInsert = Tables["collection_items"]["Insert"];
export type CollectionItemUpdate = Tables["collection_items"]["Update"];

export type CourseArticle       = Tables["course_articles"]["Row"];
export type CourseArticleInsert = Tables["course_articles"]["Insert"];
export type CourseArticleUpdate = Tables["course_articles"]["Update"];

export type UserSettings       = Tables["user_settings"]["Row"];
export type UserSettingsInsert = Tables["user_settings"]["Insert"];
export type UserSettingsUpdate = Tables["user_settings"]["Update"];

export type MemberProfile       = Tables["member_profiles"]["Row"];
export type MemberProfileInsert = Tables["member_profiles"]["Insert"];
export type MemberProfileUpdate = Tables["member_profiles"]["Update"];
