import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";

const fetcher = async (url: string) => {
  const res = await fetchClient(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // @ts-ignore
    error.info = await res.json().catch(() => ({}));
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export function useRedxParcels(page = 1, search = "", limit = 15) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) {
    params.append("search", search);
  }
  
  const url = `${baseUrl}redx-parcels?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    keepPreviousData: true,
  });

  return {
    data: data?.data || [],
    pagination: data?.meta || null,
    isLoading,
    isError: error,
    mutate,
  };
}
