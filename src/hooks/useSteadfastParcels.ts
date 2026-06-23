import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";

const fetcher = async (url: string) => {
  const res = await fetchClient(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching Steadfast parcels.");
    // @ts-ignore
    error.info = await res.json().catch(() => ({}));
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  return res.json();
};

interface UseSteadfastParcelsParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export function useSteadfastParcels(params?: UseSteadfastParcelsParams) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
  if (params?.search) searchParams.append("search", params.search);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_PARCELS_URL || "steadfast-parcels";
  const url = `${baseUrl}${endpoint}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
