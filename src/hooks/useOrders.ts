import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

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
    // @ts-ignore
    error.info = await res.json();
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  return res.json();
};

interface UseOrdersParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  payment_status?: string;
}

export function useOrders(params?: UseOrdersParams) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const ordersEndpoint = process.env.NEXT_PUBLIC_API_WEB_ORDERS || "orders";

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.status && params.status !== "All") searchParams.append("status", params.status);
  if (params?.payment_status && params.payment_status !== "All") searchParams.append("payment_status", params.payment_status);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const url = `${baseUrl}${ordersEndpoint}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    keepPreviousData: true,
  });

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
