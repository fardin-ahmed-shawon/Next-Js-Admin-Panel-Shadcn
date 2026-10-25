"use client";

import useSWR, { useSWRConfig } from "swr";
import { useAuth } from "@/hooks/useAuth";
import { fetchClient } from "@/lib/fetch-client";

const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/").replace(/\/$/, "") + "/notifications";
export const notificationModules: Record<string, string> = {
  orders: "Orders", assignments: "Order assignments", purchases: "Purchases & procurement", support: "Delivery support",
  stock: "Stock adjustments", notices: "Notices", warnings: "Warnings", holidays: "Holidays", tasks: "Peer tasks",
  upsells: "Upsells", blocklist: "Customer blocks", fines: "Employee fines", leaves: "Leaves", policies: "Policy & rules",
};
export type NotificationItem = {
  id: number; actor_name?: string | null; module: string; title: string; body: string; url: string; floating: boolean;
  created_at: string; read_at: string | null; dismissed_at: string | null;
};
export type NotificationFeed = {
  notifications: { data: NotificationItem[]; current_page: number; last_page: number; total: number };
  unread_count: number; total_count: number; latest_id: number | null; banners: NotificationItem[];
};
async function parse(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Unable to load notifications. Please retry.");
  return data;
}
export function useNotifications(query = "per_page=6") {
  const { user, isAuthenticated } = useAuth();
  return useSWR<NotificationFeed>(user && isAuthenticated ? [base + "?" + query, user.id] : null,
    ([url]: [string, number]) => fetchClient(url).then(parse),
    { refreshInterval: 20000, revalidateOnFocus: true, refreshWhenHidden: false, shouldRetryOnError: false });
}
export function useNotificationActions() {
  const { mutate } = useSWRConfig();
  const { user } = useAuth();
  return async (id: number | "read-all", action: "read" | "unread" | "dismiss", throughId?: number | null) => {
    await parse(await fetchClient(base + "/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...(throughId ? { through_id: throughId } : {}) }) }));
    await mutate(key => Array.isArray(key) && String(key[0]).startsWith(base + "?") && key[1] === user?.id);
  };
}
