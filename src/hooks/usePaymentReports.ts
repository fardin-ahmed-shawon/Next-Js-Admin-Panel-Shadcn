import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}${process.env.NEXT_PUBLIC_API_WEB_PAYMENTS || "payments"}`;

export interface CustomerInfo {
  customer_id: number;
  full_name: string;
  phone: string;
  email: string | null;
  shipping_address: string;
  shipping_area: string;
}

export interface OrderInfo {
  order_no: string;
  order_status: string;
  payment_status: string;
  order_note: string | null;
  subtotal_amount: number;
  discount_amount: number;
  shipping_charge: number;
  grand_total_amount: number;
  order_date: string;
}

export interface PaymentReportItem {
  payment_id: number;
  order_no: string;
  payment_method: string;
  acc_number: string | null;
  transaction_id: string | null;
  paid_amount: number;
  payment_date: string;
  customer: CustomerInfo | null;
  order: OrderInfo | null;
}

export interface PaymentMethodBreakdown {
  payment_method: string;
  count: number;
  total: string | number;
}

export interface PaymentReportSummary {
  total_paid_amount: string | number;
  total_store_amount: string | number;
  total_transactions: number;
  payment_methods_breakdown: PaymentMethodBreakdown[];
}

export interface PaymentReportPagination {
  current_page: number;
  data: PaymentReportItem[];
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

export interface PaymentReportResponse {
  success: boolean;
  message: string;
  summary: PaymentReportSummary;
  data: PaymentReportPagination;
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

export function usePaymentReports(params?: Record<string, any>) {
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

  const { data, error, isLoading, mutate } = useSWR<PaymentReportResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
