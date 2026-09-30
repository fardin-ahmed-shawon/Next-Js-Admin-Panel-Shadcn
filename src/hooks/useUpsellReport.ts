import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

export interface UpsellOrderItem {
  id?: number;
  product_id: number;
  title: string;
  sku: string;
  img?: string | null;
  main_category_name: string;
  qty: number;
  delivered_qty?: number;
  unit_price: number;
  line_total?: number;
  total_price?: number;
}

export interface UpsellRecord {
  id: number;
  order_no: string;
  user_id: number;
  previous_amount: number;
  new_amount: number;
  upsell_amount: number;
  delivered_amount?: number;
  eligible_upsell_amount?: number;
  status?: "pending_delivery" | "eligible" | "disqualified";
  notes: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    full_name: string;
    email: string;
    employee_detail?: {
      department?: { id: number; name: string };
      designation?: { id: number; title: string };
    };
  };
  order?: {
    id: number;
    order_no: string;
    order_status: string;
    customer_full_name: string;
    customer_phone: string;
    customer_email?: string;
    customer_shipping_address?: string;
    subtotal_amount: number;
    initial_subtotal?: number;
    grand_total_amount: number;
  };
  items?: UpsellOrderItem[];
}

export interface UpsellProductRecord {
  product_id: number;
  title: string;
  sku: string;
  img?: string | null;
  main_category_id?: number | null;
  main_category_name: string;
  total_qty: number;
  total_revenue: number;
  orders_count: number;
}

export interface UpsellEmployeeRecord {
  user_id: number;
  name: string;
  email: string;
  avatar: string;
  department_id?: number | null;
  department_name: string;
  designation_id?: number | null;
  designation_title: string;
  orders_count: number;
  total_upsell: number;
  avg_upsell: number;
}

export interface UpsellMeta {
  departments: Array<{ id: number; name: string }>;
  designations: Array<{ id: number; department_id: number; title: string }>;
  main_categories: Array<{ id: number; name: string }>;
}

export interface UpsellReportResponse {
  success: boolean;
  view: "orders" | "products" | "employees";
  summary: {
    total_upsell_orders: number;
    total_upsell_amount: number;
    avg_upsell_amount: number;
    top_upseller: {
      user_id: number;
      name: string;
      department: string;
      total_upsell: number;
      orders_count: number;
    } | null;
  };
  meta: UpsellMeta;
  data: {
    data: any[]; // UpsellRecord[] | UpsellProductRecord[] | UpsellEmployeeRecord[]
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) {
    throw new Error("Failed to load upsell report");
  }
  const json = await res.json();
  return json as UpsellReportResponse;
};

export function useUpsellReport(params?: {
  view?: "orders" | "products" | "employees";
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  designationId?: string;
  mainCategoryId?: string;
  userId?: string;
  search?: string;
  orderNo?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  productSearch?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}) {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}reports/upsell`;
  const searchParams = new URLSearchParams();

  if (params?.view) searchParams.append("view", params.view);
  if (params?.startDate) searchParams.append("start_date", params.startDate);
  if (params?.endDate) searchParams.append("end_date", params.endDate);
  if (params?.departmentId && params.departmentId !== "all") searchParams.append("department_id", params.departmentId);
  if (params?.designationId && params.designationId !== "all") searchParams.append("designation_id", params.designationId);
  if (params?.mainCategoryId && params.mainCategoryId !== "all") searchParams.append("main_category_id", params.mainCategoryId);
  if (params?.userId && params.userId !== "all") searchParams.append("user_id", params.userId);
  if (params?.search) searchParams.append("search", params.search);
  if (params?.orderNo) searchParams.append("order_no", params.orderNo);
  if (params?.customerName) searchParams.append("customer_name", params.customerName);
  if (params?.customerPhone) searchParams.append("customer_phone", params.customerPhone);
  if (params?.customerEmail) searchParams.append("customer_email", params.customerEmail);
  if (params?.productSearch) searchParams.append("product_search", params.productSearch);
  if (params?.sortBy) searchParams.append("sort_by", params.sortBy);
  if (params?.sortOrder) searchParams.append("sort_order", params.sortOrder);
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const url = searchParams.toString() ? `${baseUrl}?${searchParams.toString()}` : baseUrl;

  const { data, error, isLoading, mutate } = useSWR<UpsellReportResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}
