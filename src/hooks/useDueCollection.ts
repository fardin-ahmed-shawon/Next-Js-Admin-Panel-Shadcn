import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const fetcher = async (url: string) => {
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
    }
  };
};

export default function useDueCollection() {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_ACCOUNTS_DUE_URL || "due-collection"}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    summary: data?.summary || {},
    dues: data?.data || [],
    pagination: data?.pagination || {},
    isLoading,
    isError: error,
    mutate,
  };
}
