import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

export interface CapitalItem {
  id: number;
  amount: number;
  type?: "cash_in" | "cash_out" | string;
  investor_name?: string | null;
  title?: string | null;
  payment_method?: string | null;
  trx_id?: string | null;
  description?: string | null;
  date?: string | null;
  user_id?: number | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name?: string;
    full_name?: string;
  } | null;
}

export interface CapitalSummary {
  total_capital: number;
  total_cash_in?: number;
  total_cash_out?: number;
  total_entries: number;
  this_month_capital: number;
  this_month_cash_in?: number;
  this_month_cash_out?: number;
  this_year_capital: number;
  this_year_cash_in?: number;
  this_year_cash_out?: number;
}

export interface CapitalPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface CapitalResponse {
  success: boolean;
  message?: string;
  summary: CapitalSummary;
  data: {
    current_page: number;
    data: CapitalItem[];
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
}

export interface CapitalParams {
  page?: number;
  per_page?: number;
  search?: string;
  period?: string;
  start_date?: string;
  end_date?: string;
  payment_method?: string;
  type?: string;
}

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch cash flow records");
  }

  const json = await res.json();
  return json as CapitalResponse;
};

export default function useCapitals(params?: CapitalParams) {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}capitals`;

  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.per_page) query.append("per_page", params.per_page.toString());
  if (params?.search) query.append("search", params.search);
  if (params?.type && params.type !== "all") query.append("type", params.type);
  if (params?.period && params.period !== "alltime" && params.period !== "all") {
    query.append("period", params.period);
  }
  if (params?.start_date) query.append("start_date", params.start_date);
  if (params?.end_date) query.append("end_date", params.end_date);
  if (params?.payment_method && params.payment_method !== "all") {
    query.append("payment_method", params.payment_method);
  }

  const queryString = query.toString();
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  const { data, error, isLoading, isValidating, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: true,
  });

  return {
    summary: data?.summary || {
      total_capital: 0,
      total_cash_in: 0,
      total_cash_out: 0,
      total_entries: 0,
      this_month_capital: 0,
      this_month_cash_in: 0,
      this_month_cash_out: 0,
      this_year_capital: 0,
      this_year_cash_in: 0,
      this_year_cash_out: 0,
    },
    capitals: data?.data?.data || [],
    pagination: {
      current_page: data?.data?.current_page || 1,
      last_page: data?.data?.last_page || 1,
      per_page: data?.data?.per_page || 15,
      total: data?.data?.total || 0,
      from: data?.data?.from || 0,
      to: data?.data?.to || 0,
    },
    isLoading,
    isError: error,
    mutate,
  };
}
