import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const json = await res.json();
  return {
    summary: json.summary || {},
    data: json.data?.data || [],
    pagination: {
      current_page: json.data?.current_page,
      last_page: json.data?.last_page,
      per_page: json.data?.per_page,
      total: json.data?.total,
    },
  };
};

export interface AccountStatementSummary {
  total_capital?: number;
  total_cash_in?: number;
  total_cash_out?: number;
  total_in?: number;
  total_out?: number;
  ending_balance?: number;
  starting_balance?: number;
}

export interface AccountStatementItem {
  date: string;
  trx_id: string | null;
  type: "Revenue" | "Expense" | "Supplier Payment" | "Cash In" | "Cash Out" | string;
  details: string;
  credit: number;
  debit: number;
  balance: number;
}

export interface AccountStatementParams {
  start_date?: string;
  end_date?: string;
  type?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export default function useAccountStatements(params?: AccountStatementParams) {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_ACCOUNTS_STATEMENT_URL || "account-statements"}`;
  
  const query = new URLSearchParams();
  if (params?.start_date) query.append("start_date", params.start_date);
  if (params?.end_date) query.append("end_date", params.end_date);
  if (params?.type && params.type !== "All") query.append("type", params.type);
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.per_page) query.append("per_page", params.per_page.toString());

  const urlString = query.toString();
  const url = urlString ? `${baseUrl}?${urlString}` : baseUrl;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    summary: (data?.summary || {}) as AccountStatementSummary,
    statements: (data?.data || []) as AccountStatementItem[],
    pagination: data?.pagination || {},
    isLoading,
    isError: error,
    mutate,
  };
}

