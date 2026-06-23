import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";

const fetcher = async (url: string) => {
  const res = await fetchClient(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching Steadfast returns.");
    // @ts-ignore
    error.info = await res.json().catch(() => ({}));
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export function useSteadfastReturns() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_RETURNS_URL || "steadfast/return-requests";
  const url = `${baseUrl}${endpoint}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data: data?.data?.data || data?.data || [], // Steadfast array response
    isLoading,
    isError: error,
    mutate,
  };
}
