import { fetchClient } from "@/lib/fetch-client";
import { useEffect, useState, useCallback } from "react";

export interface Brand {
  id: number;
  name: string;
  logo: string | null;
  created_at?: string;
  updated_at?: string;
  products_count?: number;
}

export interface FormattedBrand {
  id: string;
  rawId: number;
  name: string;
  totalProducts: number;
  logo: string;
  joinedDate: string;
}

export interface BrandStats {
  total: number;
  newThisMonth: number;
  totalProducts: number;
  topTier: number;
}

export const getBrandsApiUrl = (path: string | number = "") => {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin").replace(/\/+$/, "");
  const endpoint = (process.env.NEXT_PUBLIC_API_BRANDS_URL || "brands").replace(/^\/+|\/+$/g, "");
  const sub = path ? String(path).replace(/^\/+|\/+$/g, "") : "";
  return sub ? `${base}/${endpoint}/${sub}` : `${base}/${endpoint}`;
};

export function useBrands() {
  const [brands, setBrands] = useState<FormattedBrand[]>([]);
  const [stats, setStats] = useState<BrandStats>({
    total: 0,
    newThisMonth: 0,
    totalProducts: 0,
    topTier: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = getBrandsApiUrl();
      const response = await fetchClient(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch brands (HTTP ${response.status})`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const formatted: FormattedBrand[] = result.data.map((item: any) => ({
          id: `BRD-${String(item.id).padStart(3, "0")}`,
          rawId: item.id,
          name: item.name || "Unnamed Brand",
          totalProducts: Number(item.products_count) || 0,
          logo: item.logo || "",
          joinedDate: item.created_at
            ? new Date(item.created_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        }));

        setBrands(formatted);

        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const newThisMonthCount = formatted.filter((b) => {
          if (!b.joinedDate) return false;
          const d = new Date(b.joinedDate);
          return !isNaN(d.getTime()) && d >= thirtyDaysAgo;
        }).length;

        const totalProductsCount = formatted.reduce((sum, b) => sum + b.totalProducts, 0);

        setStats({
          total: formatted.length,
          newThisMonth: newThisMonthCount,
          totalProducts: totalProductsCount,
          topTier: Math.ceil(formatted.length * 0.3),
        });
      } else {
        setBrands([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setError(msg);
      console.error("Error fetching brands:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    stats,
    loading,
    error,
    refreshBrands: fetchBrands,
  };
}

export default useBrands;
