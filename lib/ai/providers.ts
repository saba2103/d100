import { decryptSafe } from "@/lib/utils/encryption";

export interface AISessionParams {
  provider: "openai" | "anthropic";
  encryptedApiKey: string | null;
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Invokes the specified AI provider using fetch.
 */
export async function callAI({
  provider,
  encryptedApiKey,
  systemPrompt,
  userPrompt,
}: AISessionParams): Promise<string> {
  const apiKey = decryptSafe(encryptedApiKey);
  if (!apiKey) {
    throw new Error("API key not configured");
  }

  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 250,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      let errorMsg = "Anthropic request failed";
      try {
        const errData = await response.json();
        errorMsg = errData.error?.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.content?.[0]?.text || "No insights returned.";
  } else {
    // Default: OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 200,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      let errorMsg = "OpenAI request failed";
      try {
        const errData = await response.json();
        errorMsg = errData.error?.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No insights returned.";
  }
}

/**
 * Validates a newly input API key by sending a minimal test call.
 */
export async function testConnection(
  provider: "openai" | "anthropic",
  apiKey: string
): Promise<boolean> {
  if (!apiKey) return false;
  try {
    if (provider === "anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      if (!response.ok) {
        try {
          const errData = await response.json();
          console.error("Anthropic Connection test failure:", errData);
        } catch {
          console.error("Anthropic Connection test failure status:", response.status);
        }
      }
      return response.ok;
    } else {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      if (!response.ok) {
        try {
          const errData = await response.json();
          console.error("OpenAI Connection test failure:", errData);
        } catch {
          console.error("OpenAI Connection test failure status:", response.status);
        }
      }
      return response.ok;
    }
  } catch (err) {
    console.error("testConnection exception:", err);
    return false;
  }
}
