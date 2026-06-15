import { fetchClient } from "@/lib/fetch-client";
import { useEffect, useState } from "react";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_MAIN_CATEGORIES_URL || ""}`;

export interface MainCategory {
  id: number;
  name: string;
  slug: string;
  img?: string | null;
  sub_categories_count?: number;
}

/**
 * Fetches only main categories from the API.
 * Endpoint: GET /api/v1/admin/main-categories
 */
function useMainCategories() {
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const res = await fetchClient(API_URL);
        if (!res.ok) throw new Error("Failed to fetch main categories");
        const result = await res.json();
        // The Laravel API wraps the categories in a 'data' array
        setMainCategories(result.data || result || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchMainCategories();
  }, []);

  return { mainCategories, loading, error };
}

export default useMainCategories;
