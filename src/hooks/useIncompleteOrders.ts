import useSWR from 'swr';
import { fetchClient } from "@/lib/fetch-client";

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

interface UseIncompleteOrdersOptions {
  tab?: 'incomplete' | 'complete';
  page?: number;
  per_page?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  all_orders?: boolean;
}

export function useIncompleteOrders(options?: UseIncompleteOrdersOptions) {
  const queryParams = new URLSearchParams();

  if (options?.tab) queryParams.append('tab', options.tab);
  if (options?.page) queryParams.append('page', options.page.toString());
  if (options?.per_page) queryParams.append('per_page', options.per_page.toString());
  if (options?.search) queryParams.append('search', options.search);
  if (options?.start_date) queryParams.append('start_date', options.start_date);
  if (options?.end_date) queryParams.append('end_date', options.end_date);
  if (options?.all_orders) queryParams.append('all_orders', '1');

  const queryString = queryParams.toString();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const endpoint = "incomplete-orders";
  const url = queryString ? `${baseUrl}${endpoint}?${queryString}` : `${baseUrl}${endpoint}`;

  const { data, error, mutate, isLoading } = useSWR(url, fetcher);

  return {
    orders: data?.data?.data || [],
    pagination: data?.data ? {
      current_page: data.data.current_page,
      last_page: data.data.last_page,
      per_page: data.data.per_page,
      total: data.data.total,
    } : null,
    summary: data?.summary || null,
    isLoading: isLoading || (!error && !data),
    isError: error,
    mutate,
  };
}
