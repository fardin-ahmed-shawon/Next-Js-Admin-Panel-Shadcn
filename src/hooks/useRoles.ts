import { useEffect, useState } from "react";
import { fetchClient } from "@/lib/fetch-client";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_ROLES || ""}`;

export interface PageAccess {
  id: number;
  role_id: number;
  dashboard: number;
  products: number;
  categories: number;
  blogs: number;
  brands: number;
  fraud_checker: number;
  blocklist: number;
  landing_pages: number;
  landing_pages_create: number;
  messages: number;
  testimonials: number;
  reviews: number;
  sales_report: number;
  slider: number;
  banner: number;
  discounts: number;
  coupons: number;
  customers: number;
  orders: number;
  all_orders: number;
  create_orders: number;
  assign_orders: number;
  accounts: number;
  revenue: number;
  expense_category: number;
  expenses: number;
  profit_loss: number;
  statements: number;
  due: number;
  refund_history: number;
  reports: number;
  reports_dashboard: number;
  product_report: number;
  product_percent: number;
  customer_report: number;
  employee_report: number;
  payment_report: number;
  parcel_report: number;
  courier_report: number;
  inventory: number;
  roles_and_permission: number;
  users: number;
  courier: number;
  history: number;
  settings: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Role {
  id: number;
  role_name: string;
  created_at: string;
  updated_at: string;
  page_access: PageAccess;
}

interface RolesApiResponse {
  success: boolean;
  message: string;
  data: Role[];
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetchClient(API_URL);
        if (!res.ok) throw new Error("Failed to fetch roles");
        const result: RolesApiResponse = await res.json();

        setRoles(result.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { roles, loading, error, setRoles };
}

export const ORDER_CONNECTED_MODULES = [
  "orders",
  "create_orders",
  "assign_orders",
  "courier",
  "history",
  "due",
  "revenue",
  "payment_report",
  "parcel_report",
  "courier_report",
];

export function hasModuleAccess(user: any, module: string): boolean {
  if (!user || !user.role) return false;
  if (user.role.role_name === "Admin") return true;
  if (!user.role.page_access) return false;

  // Exact permission match
  if (user.role.page_access[module as keyof PageAccess] === 1) return true;

  // all_orders check for order-connected modules
  if (user.role.page_access.all_orders === 1 && ORDER_CONNECTED_MODULES.includes(module)) {
    return true;
  }

  return false;
}
