import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}${process.env.NEXT_PUBLIC_API_PRODUCT_PERCENT_URL || "product-percent"}`;

export interface ProductStatusMetric {
  count: number;
  percentage: number;
}

export interface ProductPercentItem {
  sl_no: number;
  product_id: number;
  product_name: string;
  sku: string;
  img: string | null;
  date: string;
  orders: number;
  pending: ProductStatusMetric;
  confirmed: ProductStatusMetric;
  ready_to_ship: ProductStatusMetric;
  in_courier: ProductStatusMetric;
  ship_later: ProductStatusMetric;
  hold: ProductStatusMetric;
  returned: ProductStatusMetric;
  pre_order: ProductStatusMetric;
  delivered: ProductStatusMetric;
  cancelled: ProductStatusMetric;
  missing: ProductStatusMetric;
  lost: ProductStatusMetric;
  fake: ProductStatusMetric;
  trash: ProductStatusMetric;
}

export interface ProductPercentSummary {
  total_products: number;
  total_qty: number;
  pending: ProductStatusMetric;
  confirmed: ProductStatusMetric;
  ready_to_ship: ProductStatusMetric;
  in_courier: ProductStatusMetric;
  ship_later: ProductStatusMetric;
  hold: ProductStatusMetric;
  returned: ProductStatusMetric;
  pre_order: ProductStatusMetric;
  delivered: ProductStatusMetric;
  cancelled: ProductStatusMetric;
  missing: ProductStatusMetric;
  lost: ProductStatusMetric;
  fake: ProductStatusMetric;
  trash: ProductStatusMetric;
}

export interface ProductPercentPagination {
  current_page: number;
  data: ProductPercentItem[];
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
}

export interface ProductPercentResponse {
  success: boolean;
  message: string;
  summary: ProductPercentSummary;
  data: ProductPercentPagination;
}

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
};

export function useProductPercentReports(params?: Record<string, any>) {
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

  const { data, error, isLoading, mutate } = useSWR<ProductPercentResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
