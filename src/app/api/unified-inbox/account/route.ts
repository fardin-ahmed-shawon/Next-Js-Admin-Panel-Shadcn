import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  authenticateZymerceTenant,
  type InboxSessionPayload,
  IntegrationRequestError,
  requestInboxSession,
  setInboxSessionCookies,
} from "@/lib/unified-inbox/server";

export const dynamic = "force-dynamic";

async function handleAccount(request: NextRequest, shouldRegister: boolean): Promise<NextResponse> {
  try {
    const tenant = await authenticateZymerceTenant(request);
    const inboxResponse = await requestInboxSession(shouldRegister ? "register" : "session", tenant);
    const payload = (await inboxResponse.json().catch(() => ({}))) as Partial<InboxSessionPayload> & {
      error?: string;
      message?: string;
    };

    if (!shouldRegister && inboxResponse.status === 404) {
      return NextResponse.json({ registered: false });
    }

    if (!inboxResponse.ok || !payload.token) {
      return NextResponse.json(
        { error: payload.error || payload.message || "Unified Inbox could not be reached." },
        { status: inboxResponse.status || 502 },
      );
    }

    const session = payload as InboxSessionPayload;
    const response = NextResponse.json({ registered: true, user: session.user, expires_at: session.expires_at });
    setInboxSessionCookies(response, tenant, session);

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
  return handleAccount(request, true);
}
