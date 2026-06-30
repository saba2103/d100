export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildPrompt } from "@/lib/ai/buildPrompt";
import { callAI } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Auth Check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse Request Body (optional parameters)
    let timeframe: "7d" | "30d" = "7d";
    let profileId: "S" | "P" = "S";

    try {
      const body = await request.json();
      if (body.timeframe === "30d" || body.timeframe === "7d") {
        timeframe = body.timeframe;
      }
      if (body.profileId === "S" || body.profileId === "P") {
        profileId = body.profileId;
      } else {
        // Fallback to settings active profile
        const { data: settings } = await supabase
          .from("user_settings")
          .select("active_profile")
          .eq("user_id", user.id)
          .single();
        if (settings?.active_profile === "S" || settings?.active_profile === "P") {
          profileId = settings.active_profile as "S" | "P";
        }
      }
    } catch {
      // Body may be empty, use active settings profile
      const { data: settings } = await supabase
        .from("user_settings")
        .select("active_profile")
        .eq("user_id", user.id)
        .single();
      if (settings?.active_profile === "S" || settings?.active_profile === "P") {
        profileId = settings.active_profile as "S" | "P";
      }
    }

    // 1. Fetch User Settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // 2. Check Daily Rate Limit (1 generation per profile per calendar day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from("ai_insights" as any)
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("profile_tag", profileId)
      .gte("created_at", todayStart.toISOString());

    if (countError) {
      throw countError;
    }

    if (count !== null && count >= 1) {
      return NextResponse.json(
        { error: "Daily limit reached. Come back tomorrow." },
        { status: 429 }
      );
    }

    // 3. Aggregate user logs and construct the AI prompts
    const { systemPrompt, userPrompt } = await buildPrompt(
      supabase,
      user.id,
      timeframe,
      profileId
    );

    // 4. Call AI Provider
    let insight = "";
    try {
      insight = await callAI({
        provider: "anthropic",
        encryptedApiKey: null,
        systemPrompt,
        userPrompt,
      });
    } catch (aiErr: any) {
      console.error("AI execution error:", aiErr);
      return NextResponse.json(
        { error: "Couldn't generate insight right now. Try again later." },
        { status: 502 }
      );
    }

    // 5. Store generated insight in DB
    const { data: savedInsight, error: insertError } = await supabase
      .from("ai_insights" as any)
      .insert({
        user_id: user.id,
        profile_tag: profileId,
        insight: insight.trim(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      insight: (savedInsight as any).insight,
      generatedAt: (savedInsight as any).created_at,
    });
  } catch (err: any) {
    console.error("Generate Insight Route error:", err);
    return NextResponse.json(
      { error: "Couldn't generate insight right now. Try again later." },
      { status: 500 }
    );
  }
}
