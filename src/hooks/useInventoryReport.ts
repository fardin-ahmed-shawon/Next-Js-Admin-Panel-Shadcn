import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";

export interface InventoryMovement {
  id: number;
  inventory_lot_id: number | null;
  product_id: number | null;
  product_variant_id: number | null;
  product_title: string;
  product_thumbnail_img: string | null;
  sku: string | null;
  variant_label: string | null;
  event_type: string;
  quantity: number;
  stock_before: number | null;
  stock_after: number | null;
  purchase_price: string | null;
  supplier_name: string | null;
  invoice_no: string | null;
  memo_image: string | null;
  total_amount: string | null;
  paid_amount: string | null;
  due_amount: string | null;
  payment_status: string | null;
  order_no: string | null;
  source: string | null;
  actor_name: string | null;
  comment: string | null;
  occurred_at: string;
  is_historical: boolean;
  metadata: Record<string, unknown> | null;
}

export interface InventoryReportData {
  records: { data: InventoryMovement[]; current_page: number; last_page: number; total: number };
  summary: Record<string, number | string>;
  daily: { date: string; movements: number; units_in: number; units_out: number; net_units: number }[];
  options: {
    sources: string[];
    suppliers: { supplier_id: number; supplier_name: string }[];
    actors: { actor_id: number; actor_name: string }[];
  };
  timezone: string;
  history_notice: string;
}

export const inventoryReportUrl = `${(process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/?$/, "/")}reports/inventory`;

export async function reportFetch(url: string) {
  const response = await fetchClient(url);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Unable to load inventory report.");
  }
  return response;
}

export default function useInventoryReport(query: string, enabled = true) {
  return useSWR<InventoryReportData>(
    enabled ? `${inventoryReportUrl}?${query}` : null,
    async (url: string) => (await (await reportFetch(url)).json()).data,
    { revalidateOnFocus: false },
  );
}
