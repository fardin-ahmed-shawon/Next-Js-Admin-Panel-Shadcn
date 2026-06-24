import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";
import { useAuth } from "@/hooks/useAuth";

interface UseSteadfastReturnedParcelsOptions {
  page?: number;
  per_page?: number;
  search?: string;
}

export function useSteadfastReturnedParcels(options: UseSteadfastReturnedParcelsOptions = {}) {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_RETURNED_PARCELS_URL || "steadfast/returned-parcels";

  const params = new URLSearchParams();
  if (options.page) params.append("page", options.page.toString());
  if (options.per_page) params.append("per_page", options.per_page.toString());
  if (options.search) params.append("search", options.search);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const url = `${baseUrl}${endpoint}${queryString}`;

  const fetcher = async (key: string | [string, number | undefined]) => {
    const targetUrl = Array.isArray(key) ? key[0] : key;
    const response = await fetchClient(targetUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch steadfast returned parcels data");
    }
    return response.json();
  };

  const { data, error, isLoading, mutate } = useSWR(
    user?.id ? [url, user.id] : url,
    fetcher
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
