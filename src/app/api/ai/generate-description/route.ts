import { checkAiFeature } from "@/lib/check-ai-feature";
import { NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const getApiKey = () => process.env.OPEN_AI_API_KEY || process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  const featureError = await checkAiFeature();
  if (featureError) return featureError;

  try {
    const { productName, categoryName, subCategoryName } = await req.json();
    if (!productName?.trim() || !categoryName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Product name and main category are required." },
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

    const openAiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        input: [
          {
            role: "system",
            content:
              "You are an expert e-commerce copywriter. Write accurate, appealing copy without inventing specifications that were not provided.",
          },
          {
            role: "user",
            content: `Create product copy for:\nProduct: ${productName.trim()}\nMain category: ${categoryName.trim()}\nSubcategory: ${subCategoryName?.trim() || "Not provided"}\n\nThe short description must be one concise sentence with no HTML. The long description must be useful, engaging HTML using only <p>, <ul>, <li>, and <strong> tags.`,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "product_descriptions",
            strict: true,
            schema: {
              type: "object",
              properties: { shortDescription: { type: "string" }, longDescription: { type: "string" } },
              required: ["shortDescription", "longDescription"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    const responseData = await openAiResponse.json();
    if (!openAiResponse.ok) throw new Error(responseData?.error?.message || "OpenAI could not generate descriptions.");
    const outputText = responseData.output
      ?.flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? [])
      .find((content: { type?: string }) => content.type === "output_text")?.text;
    if (!outputText) throw new Error("OpenAI returned no description content.");
    return NextResponse.json({ success: true, data: JSON.parse(outputText) });
  } catch (error) {
    console.error("Error generating product descriptions:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Something went wrong." },
      { status: 500 },
    );
  }
}
