import * as React from "react";

import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

import { type RecommendationProduct } from "./useProductRecommendations";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) throw new Error("Failed to search products");
  return res.json();
};

/**
 * Searches products by a query string against the products list endpoint.
 * Uses a 350 ms debounce so we don't fire on every keystroke.
 * Handles both paginated (result.data.data[]) and flat (result.data[]) shapes.
 */
export function useProductSearch(query: string) {
  const [debounced, setDebounced] = React.useState(query);

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(id);
  }, [query]);

  const url =
    debounced.trim().length >= 1
      ? `${BASE}products?search=${encodeURIComponent(debounced.trim())}&per_page=20`
      : null;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  // Backend returns: { success: true, data: { data: Product[], ... } }
  const raw = data?.data;
  const products: RecommendationProduct[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
    ? raw.data
    : [];

  return { products, error, isLoading };
}
