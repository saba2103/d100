import { NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

export async function POST(req: Request) {
  try {
    const { image, text } = await req.json();

    if (!image && !text) {
      return NextResponse.json({ error: "Please provide a food image or description." }, { status: 400 });
    }

    const systemPrompt = `You are an expert nutritional AI assistant. Analyze the food provided and estimate the nutritional composition.
Identify the food item(s), estimate serving size, total calories (kcal), protein (g), carbs (g), and fat (g).

Return ONLY raw JSON with no markdown formatting, no backticks, and no explanation text.
Use the following exact JSON schema:
{
  "name": string,
  "quantity": number,
  "unit": "plate" | "serving" | "bowl" | "piece" | "g" | "ml",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number
}`;

    // Build user message content
    let userContent: any[];
    if (image) {
      const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      const mediaType = match ? match[1] : "image/png";
      const base64Data = match ? match[2] : image;
      userContent = [
        {
          type: "image",
          source: { type: "base64", media_type: mediaType, data: base64Data },
        },
        {
          type: "text",
          text: "Identify the food in this image and estimate its calories, protein, carbs, and fat in JSON format.",
        },
      ];
    } else {
      userContent = [
        {
          type: "text",
          text: `Estimate the nutritional macros for the following food description and return as JSON:\n\n"${text}"`,
        },
      ];
    }

    const candidateModels = ["claude-sonnet-4-6", "claude-3-5-sonnet-latest", "claude-3-haiku-20240307"];
    let parsedData: any = null;
    let lastErrorDetail = "";

    for (const modelName of candidateModels) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: modelName,
            max_tokens: 600,
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
          break;
        } else {
          const errorText = await response.text();
          console.error(`Anthropic nutrition model ${modelName} error:`, errorText);
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
    console.error("Food Analyze API Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to analyze food." }, { status: 500 });
  }
}
