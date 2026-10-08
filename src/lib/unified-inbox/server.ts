import type { NextRequest, NextResponse } from "next/server";

const DEFAULT_INBOX_API_URL = "https://api-zymerce-inbox.easytechx.com";

interface ZymerceUser {
  id: number | string;
  tenant_id?: number | string | null;
  account_type?: "tenant" | "user";
  full_name?: string;
  store_name?: string;
  email?: string;
  phone?: string | null;
  role?: { role_name?: string; page_access?: { unified_inbox?: number | string } };
}

export interface ZymerceTenantIdentity {
  tenantId: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface InboxSessionPayload {
  registered: boolean;
  token: string;
  expires_at?: string;
  user?: Record<string, unknown>;
}

export class IntegrationRequestError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

function zymerceApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!configured) {
    throw new IntegrationRequestError("The Zymerce API URL is not configured.", 503);
  }

  return configured.endsWith("/") ? configured : `${configured}/`;
}

export function inboxApiUrl(): string {
  return (process.env.UNIFIED_INBOX_API_BASE_URL || DEFAULT_INBOX_API_URL).replace(/\/$/, "");
}

export function internalApiToken(): string {
  const token = process.env.UNIFIED_INBOX_INTERNAL_API_TOKEN;

  if (!token) {
    throw new IntegrationRequestError("Unified Inbox server credentials are not configured.", 503);
  }

  return token;
}

export async function authenticateZymerceTenant(request: NextRequest): Promise<ZymerceTenantIdentity> {
  const authToken = request.cookies.get("auth_token")?.value;

  if (!authToken) {
    throw new IntegrationRequestError("Please log in to Zymerce first.", 401);
  }

  const response = await fetch(`${zymerceApiUrl()}me`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${authToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new IntegrationRequestError("Your Zymerce session has expired.", 401);
  }

  const payload = (await response.json()) as { data?: ZymerceUser; user?: ZymerceUser } & ZymerceUser;
  const user = payload.data ?? payload.user ?? payload;
  const tenantId = user.account_type === "tenant" ? user.id : (user.tenant_id ?? user.id);
  if (user.account_type !== "tenant" && user.role?.role_name !== "Admin" && Number(user.role?.page_access?.unified_inbox) !== 1) {
    throw new IntegrationRequestError("You do not have permission to access Unified Inbox.", 403);
  }

  if (tenantId === undefined || tenantId === null) {
    throw new IntegrationRequestError("This account is not connected to a Zymerce tenant.", 403);
  }

  if (!user.email) {
    throw new IntegrationRequestError("The tenant account does not have an email address.", 422);
  }

  return {
    tenantId: String(tenantId),
    name: user.store_name || user.full_name || `Zymerce Tenant ${tenantId}`,
    email: user.email,
    phone: user.phone || null,
  };
}

export async function requestInboxSession(
  endpoint: "session" | "register",
  tenant: ZymerceTenantIdentity,
  credentials?: { email?: string; password?: string },
): Promise<Response> {
  const bodyPayload: Record<string, any> = {
    tenant_id: tenant.tenantId,
    email: credentials?.email || tenant.email,
  };

  if (endpoint === "register") {
    bodyPayload.name = tenant.name;
    bodyPayload.phone = tenant.phone;
    bodyPayload.password = credentials?.password || "12345678";
  } else if (credentials?.password) {
    bodyPayload.password = credentials.password;
  }

  return fetch(`${inboxApiUrl()}/api/integrations/zymerce/${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${internalApiToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyPayload),
    cache: "no-store",
  });
}

export function setInboxSessionCookies(
  response: NextResponse,
  tenant: ZymerceTenantIdentity,
  session: InboxSessionPayload,
): void {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };

  response.cookies.set("unified_inbox_token", session.token, cookieOptions);
  response.cookies.set("unified_inbox_tenant", tenant.tenantId, cookieOptions);
}
