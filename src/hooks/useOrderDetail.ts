import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) {
    const error = new Error("Failed to fetch order detail.");
    // @ts-ignore
    error.info = await res.json();
    // @ts-ignore
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export function useOrderDetail(orderNo: string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";

  const url = orderNo ? `${baseUrl}orders/${orderNo}` : null;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data: data?.data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
