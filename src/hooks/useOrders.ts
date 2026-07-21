import { fetchClient } from "@/lib/fetch-client";
import { useAuth } from "@/hooks/useAuth";
import useSWR from "swr";

const fetcher = async (key: string | [string, number | undefined]) => {
  const url = Array.isArray(key) ? key[0] : key;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // @ts-ignore
    error.info = await res.json();
    // @ts-ignore
    error.status = res.status;
    throw error;
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

interface UseOrdersParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  payment_status?: string;
  all_orders?: boolean;
  start_date?: string;
  end_date?: string;
}

export function useOrders(params?: UseOrdersParams) {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const ordersEndpoint = process.env.NEXT_PUBLIC_API_WEB_ORDERS || "orders";

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.status && params.status !== "All") searchParams.append("status", params.status);
  if (params?.payment_status && params.payment_status !== "All")
    searchParams.append("payment_status", params.payment_status);
  if (params?.all_orders) searchParams.append("all_orders", "1");
  if (params?.start_date) searchParams.append("start_date", params.start_date);
  if (params?.end_date) searchParams.append("end_date", params.end_date);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const url = `${baseUrl}${ordersEndpoint}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR(user?.id ? [url, user.id] : url, fetcher, {
    keepPreviousData: true,
  });

  return {
    summary: data?.summary || {},
    orders: data?.data || [],
    pagination: data?.pagination || {},
    isLoading,
    isError: error,
    mutate,
  };
}
