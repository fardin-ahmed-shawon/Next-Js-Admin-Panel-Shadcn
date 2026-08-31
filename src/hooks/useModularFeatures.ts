"use client";

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
    throw error;
  }

  return res.json();
};

export interface ModularFeaturesData {
  fraud_checker: boolean;
  accounts_dashboard: boolean;
  accounts_revenue: boolean;
  accounts_expenses: boolean;
  accounts_profit_n_loss: boolean;
  accounts_statement: boolean;
  accounts_due: boolean;
  accounts_refund_history: boolean;
  accounts_channel: boolean;
  variant_management: boolean;
  variant_wise_pricing: boolean;
  variant_wise_image: boolean;
  inventory_multiple_lot: boolean;
  inventory_bulk_upload: boolean;
  product_yt_reels: boolean;
  product_pre_order: boolean;
  product_seo_settings: boolean;
  product_ai_recommendation: boolean;
  orders_manual_create: boolean;
  orders_wholesale_create: boolean;
  orders_incomplete: boolean;
  orders_invoice_manage: boolean;
  orders_invoice_manage_detailed: boolean;
  orders_invoice_a4: boolean;
  orders_invoice_pos: boolean;
  orders_invoice_label: boolean;
  employee_management: boolean;
  employee_auto_order_distribution: boolean;
  courier_basic: boolean;
  courier_order_automation: boolean;
  courier_accounts_automation: boolean;
  courier_bulk_entry: boolean;
  discounts: boolean;
  discounts_gift_product: boolean;
  regular_coupons: boolean;
  product_wise_coupon: boolean;
  testimonials: boolean;
  user_behaviour_logs: boolean;
  blogs: boolean;
  reports_product: boolean;
  reports_product_percent: boolean;
  reports_customer: boolean;
  reports_employee: boolean;
  reports_payment: boolean;
  reports_parcel: boolean;
  reports_courier: boolean;
  reports_inventory: boolean;
  reports_supplier?: boolean;
  brands: boolean;
  role_based_access_control: boolean;
  role_based_access_max_users: number | null;
  blocklist: boolean;
  sslcommerze: boolean;
  meta_pixel_n_gtm: boolean;
  other_ai_features: boolean;
  [key: string]: any;
}

export interface ModularFeaturesApiResponse {
  success: boolean;
  data: ModularFeaturesData;
}

export function useModularFeatures() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const url = `${baseUrl}modular-features`;

  const { data, error, isLoading, mutate } = useSWR<ModularFeaturesApiResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    features: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}
