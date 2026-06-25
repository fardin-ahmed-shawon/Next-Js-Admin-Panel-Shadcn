import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const API_URL = `${BASE}${process.env.NEXT_PUBLIC_API_PRODUCT_RECOMMENDATIONS || "custom-product-recommendations"}`;

export interface RecommendationProduct {
  id: number;
  title: string;
  selling_price: number;
  product_thumbnail_img: string | null;
  [key: string]: any;
}

export interface Recommendation {
  id: number;
  product_id: number;
  recommended_product_id: number;
  created_at: string;
  updated_at: string;
  product: RecommendationProduct;
  recommended_product: RecommendationProduct;
}

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
};

export function useProductRecommendations() {
  const { data, error, isLoading, mutate } = useSWR(API_URL, fetcher, {
    revalidateOnFocus: false,
  });

  const createRecommendation = async (payload: { product_id: number; recommended_product_id: number }) => {
    const res = await fetchClient(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to create recommendation");
    mutate();
    return json;
  };

  const updateRecommendation = async (id: number, payload: { recommended_product_id: number }) => {
    const res = await fetchClient(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to update recommendation");
    mutate();
    return json;
  };

  const deleteRecommendation = async (id: number) => {
    const res = await fetchClient(`${API_URL}/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to delete recommendation");
    mutate();
    return json;
  };

  return {
    data: (data?.data ?? []) as Recommendation[],
    error,
    isLoading,
    mutate,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation,
  };
}
