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

export function useTopProducts(params?: { start_date?: string; end_date?: string; limit?: number }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const topProductsEndpoint = process.env.NEXT_PUBLIC_SALES_REPORT_TOP_PRODUCTS || "sales-reports/top-products";

  const url = new URL(`${baseUrl}${topProductsEndpoint}`);
  if (params?.start_date) url.searchParams.append("start_date", params.start_date);
  if (params?.end_date) url.searchParams.append("end_date", params.end_date);
  if (params?.limit) url.searchParams.append("limit", params.limit.toString());

  const { data, error, isLoading, mutate } = useSWR(url.toString(), fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
