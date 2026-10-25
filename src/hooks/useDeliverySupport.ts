import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";
import { useAuth } from "@/hooks/useAuth";
import type { AssignmentEmployee } from "@/app/(main)/dashboard/orders/_components/employee-assignment-picker";

const base = `${(process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/").replace(/\/$/, "")}/delivery-support`;
export const issueCategories = ["Delivery Issue", "Customer Issue", "COD Change Issue"] as const;
export type DeliveryPerson = { id: number; full_name: string };
export type DeliveryOrderOption = { id: number; order_no: string; order_status: string | null };
export type DeliveryIssue = {
  id: number; order_no: string; category: string; note: string; raised_by: number | null; assigned_to: number | null;
  raiser: DeliveryPerson | null; handler: DeliveryPerson | null; approver: DeliveryPerson | null;
  resolved: boolean; approved: boolean; resolution_note: string | null; created_at: string;
  resolved_at: string | null; approved_at: string | null; version: number;
  can_assign: boolean; can_handle: boolean; can_approve: boolean;
};
export type DeliveryRanking = { id: number; name: string; total: number; resolved: number; rate: number };
export type DeliveryOverview = {
  stats: { total: number; resolved: number; pending_approval: number; approved: number };
  ranking: DeliveryRanking[];
  permissions: Record<"create" | "assign" | "handle" | "approve" | "export" | "reporting_team" | "all", boolean>;
};
export type DeliveryEvent = { id: number; action: string; note: string | null; actor: DeliveryPerson | null; created_at: string };
export type DeliveryPage<T> = { filter_options?: { raisers: DeliveryPerson[]; handlers: DeliveryPerson[] }; data: T[]; current_page: number; last_page: number; total: number; from: number | null; to: number | null };
export type IssueAction = "assign" | "resolve" | "reopen" | "approve" | "unapprove" | "comment";

async function parse(response: Response) {
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const validation = result?.errors ? Object.values(result.errors).flat().join(" ") : "";
    throw new Error(validation || result?.message || `Unable to load delivery support (${response.status}).`);
  }
  return result;
}
const fetcher = async (url: string) => parse(await fetchClient(url));
const scopedFetcher = ([url]: [string, number]) => fetcher(url);

export function useDeliverySupport(query: string, enabled: boolean) {
  const { user } = useAuth();
  const list = useSWR<DeliveryPage<DeliveryIssue>>(enabled && user ? [`${base}/issues?${query}`, user.id] : null, scopedFetcher, { refreshInterval: 30000 });
  const overview = useSWR<DeliveryOverview>(enabled && user ? [`${base}/overview?${query}`, user.id] : null, scopedFetcher, { refreshInterval: 30000 });
  return { list, overview, refresh: () => Promise.all([list.mutate(), overview.mutate()]) };
}
export function useDeliveryIssue(id: number | null, page = 1) {
  const { user } = useAuth();
  return useSWR<{ data: DeliveryIssue; events: DeliveryPage<DeliveryEvent> }>(id && user ? [`${base}/issues/${id}?page=${page}`, user.id] : null, scopedFetcher);
}
export function useDeliveryRecipients(enabled: boolean) {
  const { user } = useAuth();
  return useSWR<{ data: AssignmentEmployee[] }>(enabled && user ? [`${base}/recipients`, user.id] : null, scopedFetcher);
}
export function useDeliveryOrders(search: string) {
  const { user } = useAuth();
  return useSWR<{ data: DeliveryOrderOption[] }>(search.trim().length >= 2 && user
    ? [`${base}/orders?search=${encodeURIComponent(search.trim())}`, user.id] : null, scopedFetcher);
}
export async function createDeliveryIssue(data: { order_no: string; category: string; note: string; assigned_to?: number | null }) {
  return parse(await fetchClient(`${base}/issues`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }));
}
export async function changeDeliveryIssue(issue: DeliveryIssue, action: IssueAction, note?: string, assigned_to?: number | null) {
  return parse(await fetchClient(`${base}/issues/${issue.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, version: issue.version, note, ...(action === "assign" ? { assigned_to } : {}) }) }));
}
export async function exportDeliveryIssues(query: string) {
  const response = await fetchClient(`${base}/export?${query}&format=xlsx`);
  if (!response.ok) { await parse(response); return; }
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = "delivery-issues.xlsx"; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
