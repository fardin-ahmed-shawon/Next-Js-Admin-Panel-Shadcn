import Cookies from "js-cookie";
import { useAuth } from "@/hooks/useAuth";

type DataLayerPayload = Record<string, unknown>;

declare global {
  interface Window { dataLayer?: DataLayerPayload[]; }
}

function pushPurchaseEvents(payload: unknown) {
  if (typeof window === "undefined" || !payload || typeof payload !== "object") return;
  const body = payload as { purchase_event?: DataLayerPayload | null; purchase_events?: DataLayerPayload[] };
  const events = [...(body.purchase_event ? [body.purchase_event] : []), ...(body.purchase_events || [])];
  if (!events.length) return;
  window.dataLayer = window.dataLayer || [];
  for (const event of events) {
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push(event);
  }
}

export const fetchClient = async (url: string, options: RequestInit = {}) => {
  const token = Cookies.get("auth_token");
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const user = useAuth.getState().user;
  if (user?.id) {
    const userId = user.id.toString();
    headers.set("X-User-Id", userId);
    headers.set("user-id", userId);
    headers.set("user_id", userId);
  }
  const response = await fetch(url, { ...options, headers });
  const method = (options.method || "GET").toUpperCase();
  if (response.ok && method !== "GET" && method !== "HEAD") {
    try { pushPurchaseEvents(await response.clone().json()); } catch { /* no analytics payload */ }
  }
  return response;
};