import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const fetcher = async (url: string) => {
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

  return res.json();
};

export function useInvoices(
  page: number = 1,
  perPage: number = 20,
  filters?: {
    search?: string;
    type?: string;
    from_date?: string;
    to_date?: string;
  }
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const invoicesEndpoint = process.env.NEXT_PUBLIC_API_WEB_INVOICES || "invoices";

  let url = `${baseUrl}${invoicesEndpoint}?page=${page}&per_page=${perPage}`;

  if (filters) {
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.type && filters.type !== "All") url += `&type=${encodeURIComponent(filters.type)}`;
    if (filters.from_date) url += `&from_date=${encodeURIComponent(filters.from_date)}`;
    if (filters.to_date) url += `&to_date=${encodeURIComponent(filters.to_date)}`;
  }

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
