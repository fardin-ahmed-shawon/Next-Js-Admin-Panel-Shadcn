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
  return json.data || [];
};

export default function useExpenseCategories() {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_EXPENSE_CATEGORIES_URL || "expense-categories"}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    expenseCategories: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
