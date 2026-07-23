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

interface UseInvoicesOptions {
  page?: number;
  perPage?: number;
  type?: string;
  search?: string;
  fromDate?: string | null;
  toDate?: string | null;
  sort?: string;
  orderDate?: string;
}

export function useInvoices({ page = 1, perPage = 20, type = "All", search = "", fromDate, toDate, sort = "desc", orderDate = "" }: UseInvoicesOptions = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const invoicesEndpoint = process.env.NEXT_PUBLIC_API_WEB_INVOICES || "invoices";

  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    type,
    search,
    ...(fromDate && { from_date: fromDate }),
    ...(toDate && { to_date: toDate }),
    ...(orderDate && { order_date: orderDate }),
    sort,
  });

  const url = `${baseUrl}${invoicesEndpoint}?${queryParams.toString()}`;

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
