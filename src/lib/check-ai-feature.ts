import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function checkAiFeature() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
  try {
    const user = await fetch(base + "me", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!user.ok) return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    const response = await fetch(base + "modular-features", { cache: "no-store" });
    if (!response.ok) throw new Error("Feature settings unavailable");
    const result = await response.json();
    if (!(result.effective?.other_ai_features ?? result.data?.other_ai_features)) {
      return NextResponse.json(
        { success: false, message: "AI description and image generation is disabled." },
        { status: 403 },
      );
    }
    return null;
  } catch {
    return NextResponse.json({ success: false, message: "Unable to check feature availability." }, { status: 503 });
  }
}
