import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}${process.env.NEXT_PUBLIC_API_COURIER_REPORTS_URL || "courier-reports"}`;

export interface CourierReportItem {
  sl: number;
  courier_name: string;
  all: number;
  pending_count: number;
  pending_percentage: number;
  confirmed_count: number;
  confirmed_percentage: number;
  ready_to_ship_count: number;
  ready_to_ship_percentage: number;
  in__courier_count: number;
  in__courier_percentage: number;
  ship_later_count: number;
  ship_later_percentage: number;
  hold_count: number;
  hold_percentage: number;
  returned_count: number;
  returned_percentage: number;
  pre__order_count: number;
  pre__order_percentage: number;
  delivered_count: number;
  delivered_percentage: number;
  cancelled_count: number;
  cancelled_percentage: number;
  missing_count: number;
  missing_percentage: number;
  lost_count: number;
  lost_percentage: number;
  fake_count: number;
  fake_percentage: number;
  trash_count: number;
  trash_percentage: number;
}

export interface CourierAnalyticsResponse {
  success: boolean;
  message: string;
  data: CourierReportItem[];
  stats: {
    total_orders: number;
    not_distributed_count: number;
    not_distributed_percentage: number;
    [key: string]: any;
  };
}

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) throw new Error("Failed to fetch courier reports.");
  
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch courier reports.");
  }
  return data;
};

export function useCourierAnalytics(queryParams: Record<string, any> = {}) {
  // Construct query string manually or via URLSearchParams
  const searchParams = new URLSearchParams();
  Object.keys(queryParams).forEach((key) => {
    if (queryParams[key] !== undefined && queryParams[key] !== "") {
      searchParams.append(key, queryParams[key]);
    }
  });
  
  const queryStr = searchParams.toString();
  const url = `${API_URL}${queryStr ? `?${queryStr}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<CourierAnalyticsResponse>(
    url,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}
