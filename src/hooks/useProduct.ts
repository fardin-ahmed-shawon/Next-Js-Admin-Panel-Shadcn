import { fetchClient } from "@/lib/fetch-client";
import { useEffect, useState, useCallback } from "react";
import { Product } from "./useProducts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchClient(`${API_BASE_URL}product/${id}`, {
        headers: {
          "Accept": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch product");
      
      const result = await res.json();
      if (result.success) {
        setProduct(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch product");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}

export default useProduct;
