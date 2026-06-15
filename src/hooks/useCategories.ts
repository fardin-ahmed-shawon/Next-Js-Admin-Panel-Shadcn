import { fetchClient } from "@/lib/fetch-client";
import { useEffect, useState } from "react";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_CATEGORIES_URL || ""}`;

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface Category {
  id: number;
  main_category_name: string;
  main_category_slug: string;
  description?: string;
  image?: string;
  created_at?: string;
  "sub-categories"?: SubCategory[];
}

interface CategoryApiResponse {
  success: boolean;
  total_categories: number;
  total_main_categories: number;
  total_sub_categories: number;
  data: Category[];
}

/**
 * Fetches all categories (main + sub) from the API.
 * Endpoint: GET /api/v1/admin/categories
 */
function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<{ total: number; main: number; sub: number }>({
    total: 0,
    main: 0,
    sub: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetchClient(API_URL);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const result = await res.json();

        // Update states based on new API structure
        setCategories(result.data || []);
        if (result.success !== undefined) {
          setStats({
            total: result.total_categories || 0,
            main: result.total_main_categories || 0,
            sub: result.total_sub_categories || 0,
          });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, stats, loading, error };
}

export default useCategories;
