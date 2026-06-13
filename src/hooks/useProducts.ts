import { useEffect, useState, useCallback } from "react";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}products`;

export interface Product {
  id: number;
  title: string;
  sku: string | null;
  product_thumbnail_img: string | null;
  regular_price: number;
  selling_price: number;
  available_stock: number;
  status: string;
  mainCategory?: { id: number; name: string };
  subCategory?: { id: number; name: string };
  [key: string]: any;
}

export interface ProductsResponse {
  current_page: number;
  data: Product[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface ProductsStatsData {
  total_products: number;
  active_products: number;
  inactive_products: number;
}

interface FetchProductsOptions {
  page?: number;
  per_page?: number;
  search?: string;
  main_category_id?: string;
  sub_category_id?: string;
  status?: string;
}

function useProducts(options: FetchProductsOptions = {}) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [stats, setStats] = useState<ProductsStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (currentOptions: FetchProductsOptions) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(API_URL);
      if (currentOptions.page) url.searchParams.append("page", currentOptions.page.toString());
      if (currentOptions.per_page) url.searchParams.append("per_page", currentOptions.per_page.toString());
      if (currentOptions.search) url.searchParams.append("search", currentOptions.search);
      if (currentOptions.main_category_id && currentOptions.main_category_id !== "all") {
        url.searchParams.append("main_category_id", currentOptions.main_category_id);
      }
      if (currentOptions.sub_category_id && currentOptions.sub_category_id !== "all") {
        url.searchParams.append("sub_category_id", currentOptions.sub_category_id);
      }
      if (currentOptions.status && currentOptions.status !== "All") {
        url.searchParams.append("status", currentOptions.status);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch products");
      
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        if (result.total_products !== undefined) {
          setStats({
            total_products: result.total_products,
            active_products: result.active_products,
            inactive_products: result.inactive_products,
          });
        }
      } else {
        throw new Error(result.message || "Failed to fetch products");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(options);
  }, [fetchProducts, JSON.stringify(options)]);

  const refetch = () => {
    fetchProducts(options);
  };

  return { data, stats, loading, error, refetch };
}

export default useProducts;
