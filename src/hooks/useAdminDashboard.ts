import { fetchClient } from "@/lib/fetch-client";
import { useAuth } from "@/hooks/useAuth";
import useSWR from "swr";

const fetcher = async (key: string | [string, number | undefined]) => {
  const url = Array.isArray(key) ? key[0] : key;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // @ts-ignore
    error.info = await res.json();
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export interface DashboardMetrics {
  total_products: number;
  total_categories: number;
  total_stock: number;
  customers: number;
  total_purchased_unit: number;
  total_collection: number;
  pending_orders: number;
  approved_orders: number;
}

export interface OrderOverview {
  Delivered: number;
  Hold: number;
  Pending: number;
}

export interface PaymentTrendChartItem {
  period: string;
  revenue: number;
  volume: number;
}

export interface PaymentTrends {
  total_processing: number;
  methods: {
    bKash?: string;
    "Cash on Delivery"?: string;
    Nagad?: string;
    [key: string]: any;
  };
  chart_data?: PaymentTrendChartItem[];
}

export interface RevenueExpenseChartItem {
  name: string;
  sales: number | string;
  expense: number | string;
}

export interface TopProduct {
  product_title: string;
  image: string;
  total_units: string;
}

export interface DashboardOrder {
  id: number;
  order_no: string;
  customer_id: number;
  customer_ip_address: string;
  customer_full_name: string;
  customer_phone: string;
  customer_email: string;
  customer_shipping_address: string;
  shipping_area: string;
  order_note: string;
  subtotal_amount: number;
  discount_amount: number;
  shipping_charge: number;
  grand_total_amount: number;
  order_status: string;
  payment_status: string;
  order_visibility: string;
  is_restock_inventory: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DashboardLists {
  pending: DashboardOrder[];
  active: DashboardOrder[];
}

export interface DashboardData {
  metrics: DashboardMetrics;
  order_overview: OrderOverview;
  payment_trends: PaymentTrends;
  revenue_expense_chart: RevenueExpenseChartItem[];
  top_products: TopProduct[];
  lists: DashboardLists;
}

export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
}

export function useAdminDashboard() {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const dashboardEndpoint = process.env.NEXT_PUBLIC_API_ADMIN_DASHBOARD_URL || "dashboard";

  const url = `${baseUrl}${dashboardEndpoint}`;

  const { data, error, isLoading, mutate } = useSWR<DashboardApiResponse>(
    user?.id ? [url, user.id] : url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}
