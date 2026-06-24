import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}${process.env.NEXT_PUBLIC_API_PARCEL_REPORTS_URL || "courier-reports"}`;

export interface CourierReportData {
  id: number;
  date: string;
  order_no: string;
  courier_name: string;
  tracking_code: string;
  parcel_status: string;
  order_status: string;
  payment_status: string;
  customer?: {
    full_name: string;
    phone: string;
    email: string;
  } | null;
  grand_total_amount?: number;
  paid_amount?: number;
}

export interface CourierReportStats {
  total_parcels: number;
  total_order_value: number;
  total_revenue_collected: number;
  delivery_success_rate: number;
  return_rate: number;
  cancellation_rate: number;
  [key: string]: any;
}

export interface CourierReportResponse {
  success: boolean;
  stats: CourierReportStats;
  table_data: {
    current_page: number;
    data: CourierReportData[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
};

export function useCourierReports(params?: Record<string, any>) {
  let url = API_URL;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const { data, error, isLoading, mutate } = useSWR<CourierReportResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
