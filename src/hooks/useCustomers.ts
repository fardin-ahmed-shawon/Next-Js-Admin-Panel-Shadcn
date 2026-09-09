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

export function useCustomers(report = false) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const customersEndpoint = report ? "reports/customers" : process.env.NEXT_PUBLIC_API_WEB_CUSTOMERS || "customers";

  const url = `${baseUrl}${customersEndpoint}`;

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
