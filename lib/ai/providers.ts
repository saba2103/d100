import { decryptSafe } from "@/lib/utils/encryption";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

export interface AISessionParams {
  provider: "openai" | "anthropic";
  encryptedApiKey: string | null;
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Invokes the Anthropic AI provider using the system API key.
 */
export async function callAI({
  systemPrompt,
  userPrompt,
}: AISessionParams): Promise<string> {
  const apiKey = ANTHROPIC_API_KEY;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8096,
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
}

/**
 * Validates the hardcoded API connection.
 */
export async function testConnection(
  provider: "openai" | "anthropic",
  apiKey: string
): Promise<boolean> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
    });
    return response.ok;
  } catch (err) {
    console.error("testConnection exception:", err);
    return false;
  }
}
