import { checkAiFeature } from "@/lib/check-ai-feature";
import { NextResponse } from "next/server";

const OPENAI_IMAGE_API_URL = "https://api.openai.com/v1/images/generations";
const getApiKey = () => process.env.OPEN_AI_API_KEY || process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  const featureError = await checkAiFeature();
  if (featureError) return featureError;

  try {
    const { productName, categoryName, subCategoryName } = await req.json();
    if (!productName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Enter a product name before generating an image." },
        { status: 400 },
      );
    }
    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "OPEN_AI_API_KEY is not set in .env.local." },
        { status: 500 },
      );
    }

    const prompt = [
      `Create a polished square e-commerce product photograph of ${productName.trim()}.`,
      categoryName ? `Product category: ${categoryName.trim()}.` : "",
      subCategoryName ? `Subcategory: ${subCategoryName.trim()}.` : "",
      "Show one clearly identifiable product, centered on a clean neutral studio background, with soft professional lighting and a subtle natural shadow.",
      "No text, labels, logos, watermarks, borders, people, hands, or extra props. Photorealistic, catalog-ready composition.",
    ]
      .filter(Boolean)
      .join(" ");

    const openAiResponse = await fetch(OPENAI_IMAGE_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt,
        size: "1024x1024",
        quality: "medium",
        output_format: "png",
        n: 1,
      }),
    });
    const responseData = await openAiResponse.json();
    if (!openAiResponse.ok) throw new Error(responseData?.error?.message || "OpenAI could not generate an image.");
    const imageBase64 = responseData.data?.[0]?.b64_json;
    if (!imageBase64) throw new Error("OpenAI returned no image data.");
    return NextResponse.json({ success: true, data: { imageBase64, mimeType: "image/png" } });
  } catch (error) {
    console.error("Error generating product image:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Something went wrong." },
      { status: 500 },
    );
  }
}
