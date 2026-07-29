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
    data: json.data?.data || [],
    pagination: {
      current_page: json.data?.current_page,
      last_page: json.data?.last_page,
      per_page: json.data?.per_page,
      total: json.data?.total,
    },
  };
};

interface UseAiCallingLogsParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export function useAiCallingLogs(params: UseAiCallingLogsParams = {}) {
  const { user } = useAuth();
  
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.per_page) query.append("per_page", params.per_page.toString());
  if (params.search) query.append("search", params.search);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const url = `${baseUrl}ai-calling-logs?${query.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(user ? [url, params.page] : null, fetcher);

  return {
    logs: data?.data || [],
    pagination: data?.pagination || {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    },
    isLoading,
    error,
    mutate,
  };
}
