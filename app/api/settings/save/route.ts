export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/utils/encryption";

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

    let encryptedKey: string | null = null;
    
    if (apiKey) {
      // If the user cleared the key, save null
      if (apiKey.trim() === "") {
        encryptedKey = null;
      } else {
        encryptedKey = encrypt(apiKey.trim());
      }
    }

    // Update settings in database
    const updatePayload: any = {
      ai_provider: provider,
      updated_at: new Date().toISOString(),
    };

    if (apiKey !== undefined) {
      updatePayload.ai_api_key_encrypted = encryptedKey;
    }

    const { error: dbError } = await supabase
      .from("user_settings")
      .update(updatePayload)
      .eq("user_id", user.id);

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Save Settings Key Route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
