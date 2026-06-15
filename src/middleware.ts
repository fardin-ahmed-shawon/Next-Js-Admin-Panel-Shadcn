import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  if (!token && isDashboardPage) {
    // Redirect to login if trying to access dashboard without a token
    const loginUrl = new URL("/auth/v2/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPage) {
    // Redirect to dashboard if trying to access login while already authenticated
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
