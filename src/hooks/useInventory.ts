import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

export interface InventorySummary {
  total_products: number;
  total_units: number;
  inventory_value: number;
  potential_profit: number;
  low_stock: number;
  out_of_stock: number;
  categories?: string[];
  sub_categories?: string[];
}

export interface InventoryVariant {
  id: number | string;
  name: string;
  sku: string;
  stock: number;
  price: {
    selling: number;
    purchase: number;
  };
  profit: number;
  status: "In Stock" | "Low Stock" | "Out of Stock" | string;
}

export interface InventoryItem {
  id: number | string;
  title: string;
  product_thumbnail_img: string | null;
  sku: string | null;
  category: {
    main: string | null;
    sub: string | null;
  };
  stock: number;
  price: {
    selling: number;
    purchase: number;
  };
  profit: number;
  status: "In Stock" | "Low Stock" | "Out of Stock" | string;
  variants_count: number;
  variants: InventoryVariant[];
}

export interface InventoryRecords {
  current_page: number;
  data: InventoryItem[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface InventoryData {
  summary: InventorySummary;
  records: InventoryRecords;
}

interface UseInventoryOptions {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  category?: string;
  sub_category?: string;
}

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch inventory");
  }

  const json = await res.json();
  return json.data as InventoryData;
};

export default function useInventory(options?: UseInventoryOptions) {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_INVENTORY || "inventory"}`;

  const queryParams = new URLSearchParams();
  if (options?.page) queryParams.append("page", options.page.toString());
  if (options?.per_page) queryParams.append("per_page", options.per_page.toString());
  if (options?.search) queryParams.append("search", options.search);
  if (options?.status && options.status !== "All") queryParams.append("status", options.status);
  if (options?.sort_by) queryParams.append("sort_by", options.sort_by);
  if (options?.sort_order) queryParams.append("sort_order", options.sort_order);
  if (options?.category && options.category !== "all") queryParams.append("category", options.category);
  if (options?.sub_category && options.sub_category !== "all") queryParams.append("sub_category", options.sub_category);

  const url = `${baseUrl}?${queryParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<InventoryData>(url, fetcher, {
    keepPreviousData: true,
  });

  return {
    data,
    loading: isLoading,
    error,
    mutate,
  };
}
