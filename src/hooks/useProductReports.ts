import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}${process.env.NEXT_PUBLIC_API_PRODUCT_REPORTS_URL || "product-report"}`;

export interface ProductReportVariant {
  id: number;
  name: string;
  sku: string;
  stock: number;
  purchase_price: number;
  regular_price: number;
  selling_price: number;
}

export interface ProductReportItem {
  sl_no: number;
  product_name: string;
  sku: string;
  img: string;
  size_label: string | null;
  color_label: string | null;
  purchase_price: number;
  selling_price: number;
  total_discount_amount: number;
  qty: number;
  total_sold_unit: number;
  total_order_value: number;
  total_purchase_value: number;
  total_profit: number;
  date: string;
}

export interface ProductReportSummary {
  total_products: number;
  total_sold_unit: number;
  total_order_value: number;
  total_purchase_value: number;
  total_profit: number;
}

export interface ProductReportPagination {
  current_page: number;
  data: ProductReportItem[];
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

export interface ProductReportResponse {
  success: boolean;
  message: string;
  summary: ProductReportSummary;
  data: ProductReportPagination;
}

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
};

export function useProductReports(params?: Record<string, any>) {
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

  const { data, error, isLoading, mutate } = useSWR<ProductReportResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
