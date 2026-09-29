import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

export interface OrderActivityItem {
  id: number;
  order_no: string;
  user_id: number | null;
  action_type: "status_change" | "product_edit" | "customer_update" | "courier_sent" | "upsell" | string;
  description: string;
  details: any;
  created_at: string;
  user?: {
    id: number;
    name: string;
    full_name: string;
    email: string;
    employee_detail?: {
      department?: { id: number; name: string };
      designation?: { id: number; title: string };
    };
  };
  order?: {
    id: number;
    order_no: string;
    order_status: string;
  };
}

export interface OrderActivityLogsResponse {
  data: {
    data: OrderActivityItem[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) {
    throw new Error("Failed to load activity logs");
  }
  const json = await res.json();
  return json as OrderActivityLogsResponse;
};

export function useOrderActivityLogs(params?: {
  orderNo?: string;
  userId?: number | string;
  actionType?: string;
  limit?: number;
}) {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}order-activity-logs`;
  const searchParams = new URLSearchParams();

  if (params?.orderNo) searchParams.append("order_no", params.orderNo);
  if (params?.userId) searchParams.append("user_id", String(params.userId));
  if (params?.actionType) searchParams.append("action_type", params.actionType);
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const url = searchParams.toString() ? `${baseUrl}?${searchParams.toString()}` : baseUrl;

  const { data, error, isLoading, mutate } = useSWR<OrderActivityLogsResponse>(
    params?.orderNo || params?.userId ? url : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    logs: data?.data?.data || [],
    pagination: data?.data,
    isLoading,
    error,
    mutate,
  };
}
