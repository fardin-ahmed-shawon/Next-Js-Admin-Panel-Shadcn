import { fetchClient } from "@/lib/fetch-client";
import { useAuth } from "@/hooks/useAuth";
import useSWR from "swr";

const fetcher = async (key: string | [string, number | undefined]) => {
  const url = Array.isArray(key) ? key[0] : key;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const json = await res.json();
  return {
    summary: json.summary || {},
    data: json.data?.data || [],
    pagination: {
      current_page: json.data?.current_page,
      last_page: json.data?.last_page,
      per_page: json.data?.per_page,
      total: json.data?.total,
    },
  };
};

export default function useDueCollection(params?: { source?: string; page?: number; per_page?: number; search?: string; status?: string }) {
  const { user } = useAuth();
  
  const searchParams = new URLSearchParams();
  if (params?.source) searchParams.append("source", params.source);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.status && params.status !== "All") searchParams.append("status", params.status);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_ACCOUNTS_DUE_URL || "due-collection"}${queryString}`;

  const { data, error, isLoading, mutate } = useSWR(user?.id ? [url, user.id] : url, fetcher);

  return {
    summary: data?.summary || {},
    dues: data?.data || [],
    pagination: data?.pagination || {},
    isLoading,
    isError: error,
    mutate,
  };
}
