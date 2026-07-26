import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { productName, categoryName, subCategoryName } = await req.json();

    if (!productName || !categoryName) {
      return NextResponse.json(
        { success: false, message: "Product name and main category are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "GEMINI_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert e-commerce copywriter. 
Write a short description (1-2 sentences) and a long, detailed description (formatted as HTML) for a product.

Product Name: ${productName}
Main Category: ${categoryName}
Sub Category: ${subCategoryName || "N/A"}

Requirements for short description: 
- Very brief, one liner. No HTML.

Requirements for long description: 
- Provide an engaging overview of the product.
- Highlight key features and materials if applicable.
- Format strictly as rich text HTML using <p>, <ul>, <li>, <strong> tags only.
- Do not wrap the JSON output in markdown blocks like \`\`\`json. Return pure JSON.

Respond exactly with the following JSON structure and nothing else:
{
  "shortDescription": "...",
  "longDescription": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;

    if (!text) {
      throw new Error("No text returned from Gemini.");
    }

    try {
      // Clean up potential markdown formatting in the response if the model still adds it
      const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
      const data = JSON.parse(jsonText);
      return NextResponse.json({ success: true, data });
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", text);
      return NextResponse.json(
        { success: false, message: "Failed to parse AI response." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in generate-description:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
