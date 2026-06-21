export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { testConnection } from "@/lib/ai/providers";
import { decryptSafe } from "@/lib/utils/encryption";

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

    const body = await request.json();
    const { provider, apiKey } = body;

    if (!provider || !["openai", "anthropic"].includes(provider)) {
      return NextResponse.json(
        { error: "Invalid provider specified" },
        { status: 400 }
      );
    }

    let keyToTest = apiKey;

    // If the key is omitted, or is a bullet-mask/placeholder, use the saved key
    if (!apiKey || apiKey.trim() === "" || apiKey.includes("••••") || apiKey.startsWith("Saved")) {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("ai_api_key_encrypted")
        .eq("user_id", user.id)
        .single();

      const savedKeyDecrypted = decryptSafe(settings?.ai_api_key_encrypted);
      if (!savedKeyDecrypted) {
        return NextResponse.json(
          { error: "No saved API key found to test. Please enter a key." },
          { status: 400 }
        );
      }
      keyToTest = savedKeyDecrypted;
    }

    const success = await testConnection(provider, keyToTest);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("Test Connection Route error:", err);
    return NextResponse.json(
      { error: err.message || "Test connection failed" },
      { status: 500 }
    );
  }
}
