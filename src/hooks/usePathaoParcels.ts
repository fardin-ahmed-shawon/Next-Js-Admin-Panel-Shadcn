import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";
import { useAuth } from "@/hooks/useAuth";

const fetcher = async (key: string | [string, number | undefined]) => {
  const url = Array.isArray(key) ? key[0] : key;
  const res = await fetchClient(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching Pathao parcels.");
    // @ts-ignore
    error.info = await res.json().catch(() => ({}));
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  return res.json();
};

interface UsePathaoParcelsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function usePathaoParcels(params?: UsePathaoParcelsParams) {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const url = `${baseUrl}pathao-parcels${queryString}`;

  const { data, error, isLoading, mutate } = useSWR(user?.id ? [url, user.id] : url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
