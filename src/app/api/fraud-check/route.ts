import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Validate Bangladesh phone number pattern: /^01[3-9]\d{8}$/
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid Bangladesh phone number format" }, { status: 400 });
    }

    const apiKey = process.env.FRAUD_CHECKER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Fraud Checker API Key is not configured in .env.local" },
        { status: 500 }
      );
    }

    const response = await fetch("https://fraudchecker.link/api/v1/qc/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ phone }).toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `API Error: ${response.statusText} (${errText})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to contact Fraud Checker API" },
      { status: 500 }
    );
  }
}
