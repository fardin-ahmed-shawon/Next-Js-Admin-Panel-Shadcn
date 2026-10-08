import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  authenticateZymerceTenant,
  type InboxSessionPayload,
  inboxApiUrl,
  IntegrationRequestError,
  requestInboxSession,
  setInboxSessionCookies,
} from "@/lib/unified-inbox/server";

export const dynamic = "force-dynamic";

async function handleAccount(
  request: NextRequest,
  shouldRegister: boolean,
  credentials?: { email?: string; password?: string },
): Promise<NextResponse> {
  try {
    const tenant = await authenticateZymerceTenant(request);

    // 1. If manual logout was performed, keep the user on the login screen
    const isManuallyLoggedOut = request.cookies.get("unified_inbox_manual_logout")?.value === "1";
    if (request.method === "GET" && isManuallyLoggedOut) {
      return NextResponse.json({ registered: false, loggedOut: true });
    }

    // 2. On GET (e.g. page refresh), check if an active user token is already stored in cookies
    const existingToken = request.cookies.get("unified_inbox_token")?.value;
    const boundTenantId = request.cookies.get("unified_inbox_tenant")?.value;

    if (request.method === "GET" && existingToken && boundTenantId === tenant.tenantId) {
      try {
        const meRes = await fetch(`${inboxApiUrl()}/api/auth/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${existingToken}`,
          },
          cache: "no-store",
        });

        if (meRes.ok) {
          const meData = (await meRes.json().catch(() => ({}))) as {
            user?: Record<string, unknown>;
          };
          if (meData.user) {
            // Keep the active user session and data intact! Do not overwrite it with tenant default.
            return NextResponse.json({
              registered: true,
              user: meData.user,
            });
          }
        }
      } catch (meErr) {
        console.error("Token verification failed on refresh:", meErr);
      }
    }

    // 3. If login credentials with password are provided, authenticate directly with Unified Inbox auth/login
    if (!shouldRegister && credentials?.password) {
      const loginPayload = {
        login: credentials.email || tenant.email,
        password: credentials.password,
      };

      const directLoginRes = await fetch(`${inboxApiUrl()}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(loginPayload),
      });

      const directData = (await directLoginRes.json().catch(() => ({}))) as {
        token?: string;
        user?: Record<string, unknown>;
        message?: string;
        error?: string;
        errors?: Record<string, string[]>;
      };

      if (directLoginRes.ok && directData.token) {
        const session: InboxSessionPayload = {
          registered: true,
          token: directData.token,
          user: directData.user,
        };
        const response = NextResponse.json({
          registered: true,
          user: directData.user,
        });
        setInboxSessionCookies(response, tenant, session);
        response.cookies.delete("unified_inbox_manual_logout");
        return response;
      }

      if (!directLoginRes.ok) {
        const errorMessage =
          directData.message ||
          directData.error ||
          (directData.errors ? Object.values(directData.errors).flat().join(", ") : null);
        return NextResponse.json(
          { error: errorMessage || "The provided credentials do not match our records." },
          { status: directLoginRes.status || 422 },
        );
      }
    }

    // 4. Default: request tenant session or registration from Unified Inbox
    const inboxResponse = await requestInboxSession(
      shouldRegister ? "register" : "session",
      tenant,
      credentials,
    );
    const payload = (await inboxResponse.json().catch(() => ({}))) as Partial<InboxSessionPayload> & {
      error?: string;
      message?: string;
      errors?: Record<string, string[]>;
    };

    if (!shouldRegister && inboxResponse.status === 404) {
      if (request.method === "GET") {
        return NextResponse.json({ registered: false });
      }
      return NextResponse.json(
        { error: payload.message || payload.error || "No Unified Inbox account found. Please check your credentials or click 'Register Now' to create one." },
        { status: 404 },
      );
    }

    if (!inboxResponse.ok || !payload.token) {
      const errMsg =
        payload.message ||
        payload.error ||
        (payload.errors ? Object.values(payload.errors).flat().join(", ") : "Unified Inbox could not be reached.");
      return NextResponse.json(
        { error: errMsg },
        { status: inboxResponse.status || 502 },
      );
    }

    const session = payload as InboxSessionPayload;
    const response = NextResponse.json({ registered: true, user: session.user, expires_at: session.expires_at });
    setInboxSessionCookies(response, tenant, session);
    response.cookies.delete("unified_inbox_manual_logout");

    return response;
  } catch (error) {
    if (error instanceof IntegrationRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Unified Inbox is temporarily unavailable." }, { status: 502 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleAccount(request, false);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let shouldRegister = true;
  let credentials: { email?: string; password?: string } | undefined;

  try {
    const body = await request.json().catch(() => null);

    if (body?.action === "logout") {
      const response = NextResponse.json({ registered: false, loggedOut: true });
      response.cookies.delete("unified_inbox_token");
      response.cookies.delete("unified_inbox_tenant");
      response.cookies.set("unified_inbox_manual_logout", "1", {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    if (body?.action === "login") {
      shouldRegister = false;
      if (body.email || body.password) {
        credentials = {
          email: body.email,
          password: body.password,
        };
      }
    }
  } catch {}

  return handleAccount(request, shouldRegister, credentials);
}

export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ registered: false, loggedOut: true });
  response.cookies.delete("unified_inbox_token");
  response.cookies.delete("unified_inbox_tenant");
  response.cookies.set("unified_inbox_manual_logout", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
