import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { authenticateZymerceTenant, IntegrationRequestError, inboxApiUrl } from "@/lib/unified-inbox/server";

export const dynamic = "force-dynamic";

const routeMethods: Array<[RegExp, ReadonlySet<string>]> = [
  [/^messages\/threads$/, new Set(["GET"])],
  [/^messages\/send$/, new Set(["POST"])],
  [/^messages\/[^/]+$/, new Set(["GET"])],
  [/^messages\/[^/]+\/read$/, new Set(["PUT"])],
  [/^messages\/[^/]+\/lead$/, new Set(["GET", "PUT"])],
  [/^messages\/[^/]+\/automation$/, new Set(["PUT"])],
  [/^channels$/, new Set(["GET", "DELETE"])],
  [/^channels\/(facebook|instagram)\/auth-url$/, new Set(["GET"])],
];

function isAllowed(path: string, method: string): boolean {
  return routeMethods.some(([pattern, methods]) => pattern.test(path) && methods.has(method));
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }): Promise<NextResponse> {
  try {
    const tenant = await authenticateZymerceTenant(request);
    const inboxToken = request.cookies.get("unified_inbox_token")?.value;
    const boundTenantId = request.cookies.get("unified_inbox_tenant")?.value;
    const { path: segments } = await context.params;
    const path = segments.join("/");

    if (!inboxToken || (boundTenantId && boundTenantId !== tenant.tenantId)) {
      return NextResponse.json({ error: "Activate or resume Unified Inbox first." }, { status: 401 });
    }

    if (!isAllowed(path, request.method)) {
      return NextResponse.json({ error: "Unsupported Unified Inbox operation." }, { status: 405 });
    }

    const encodedPath = segments.map(encodeURIComponent).join("/");
    const destination = new URL(`${inboxApiUrl()}/api/${encodedPath}`);
    request.nextUrl.searchParams.forEach((value, key) => {
      destination.searchParams.append(key, value);
    });
    const contentType = request.headers.get("content-type");
    const response = await fetch(destination, {
      method: request.method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${inboxToken}`,
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });

    const proxied = new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });

    if (response.status === 401) {
      proxied.cookies.delete("unified_inbox_token");
      proxied.cookies.delete("unified_inbox_tenant");
    }

    return proxied;
  } catch (error) {
    if (error instanceof IntegrationRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Unified Inbox is temporarily unavailable." }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
