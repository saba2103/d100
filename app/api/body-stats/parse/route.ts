import { NextResponse } from "next/server";

// Allow this route handler up to 60s — AI calls can be slow
export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { files, image, text } = body;

    let fileList: Array<{ dataUrl: string; name?: string }> = [];
    if (Array.isArray(files) && files.length > 0) {
      fileList = files;
    } else if (image) {
      fileList = [{ dataUrl: image }];
    }

    if (fileList.length === 0 && !text) {
      return NextResponse.json({ error: "Please provide image/PDF files or text export." }, { status: 400 });
    }

    const systemPrompt = `You are a specialized AI body composition parser for Cult Smart Scale reports, PDFs, and screenshots.
Extract all numerical metrics and status flags accurately into JSON format. If multiple files/screenshots are provided, synthesize the overall current body composition measurement.

Return ONLY raw JSON with no markdown syntax, no backticks, and no explaining text.
Use the following exact JSON structure:
{
  "measured_at": "YYYY-MM-DD",
  "weight_kg": number | null,
  "bmi": number | null,
  "body_fat_pct": number | null,
  "body_fat_kg": number | null,
  "lean_mass_kg": number | null,
  "bone_mass_kg": number | null,
  "skeletal_muscle_mass_kg": number | null,
  "skeletal_muscle_pct": number | null,
  "subcutaneous_fat_pct": number | null,
  "visceral_fat_level": number | null,
  "protein_pct": number | null,
  "body_water_pct": number | null,
  "bmr_kcal": number | null,
  "metabolic_age": number | null,
  "flags": {
    "weight": string | null,
    "bmi": string | null,
    "body_fat": string | null,
    "body_water": string | null,
    "bmr": string | null
  }
}`;

    let userContent: any[] = [];
    let hasPdf = false;

    for (const item of fileList) {
      const dataUrl = item.dataUrl;
      const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
      const mediaType = match ? match[1] : "image/png";
      const base64Data = match ? match[2] : dataUrl;

      if (mediaType === "application/pdf" || item.name?.toLowerCase().endsWith(".pdf")) {
        hasPdf = true;
        userContent.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: base64Data,
          },
        });
      } else {
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64Data,
          },
        });
      }
    }

    if (text) {
      userContent.push({
        type: "text",
        text: `Extract all body composition metrics from this Cult Smart Scale text export:\n\n${text}`,
      });
    } else {
      userContent.push({
        type: "text",
        text: "Extract all body composition metrics from the provided Cult Smart Scale report screenshot(s) or PDF(s) into the requested JSON format.",
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    };

    if (hasPdf) {
      headers["anthropic-beta"] = "pdfs-2024-09-25";
    }

    // List models to try in order of preference
    const candidateModels = ["claude-sonnet-4-6", "claude-3-5-sonnet-latest", "claude-3-haiku-20240307"];
    let lastErrorDetail = "";
    let parsedData: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: modelName,
            max_tokens: 1000,
            system: systemPrompt,
            messages: [{ role: "user", content: userContent }],
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.content?.[0]?.text || "{}";
          const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedData = JSON.parse(cleanJson);
          break; // Successfully parsed!
        } else {
          const errorText = await response.text();
          console.error(`Anthropic model ${modelName} failed:`, errorText);
          try {
            const errJson = JSON.parse(errorText);
            lastErrorDetail = errJson.error?.message || errorText;
          } catch {
            lastErrorDetail = errorText;
          }
        }
      } catch (err: any) {
        console.error(`Fetch error with model ${modelName}:`, err);
        lastErrorDetail = err.message || "Network request failed";
      }
    }

    if (!parsedData) {
      return NextResponse.json({ error: `AI Error: ${lastErrorDetail}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Parse API Catch Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to parse measurement data." }, { status: 500 });
  }
}
