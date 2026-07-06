import useSWR from "swr";

import { fetchClient } from "@/lib/fetch-client";

interface FetchError extends Error {
  info?: unknown;
  status?: number;
}

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.") as FetchError;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

interface UseUserBehaviourLogsParams {
  page?: number;
  per_page?: number;
  search?: string;
  event_type?: string;
}

export function useUserBehaviourLogs(params?: UseUserBehaviourLogsParams) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const logsEndpoint = process.env.NEXT_PUBLIC_API_USER_BEHAVIOUR_LOGS || "user-behavior-events";

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.event_type && params.event_type !== "All") {
    searchParams.append("event_type", params.event_type);
  }

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const url = `${baseUrl}${logsEndpoint}${queryString}`;

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
