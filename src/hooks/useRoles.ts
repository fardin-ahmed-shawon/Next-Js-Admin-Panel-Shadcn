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
  hrm?: number;
  hrm_overview?: number;
  hrm_leaderboard?: number;
  hrm_department_performance?: number;
  hrm_upsells?: number;
  hrm_all_upsells?: number;
  hrm_tasks?: number;
  hrm_all_tasks?: number;
  hrm_org_tree?: number;
  hrm_employees?: number;
  hrm_attendance?: number;
  hrm_all_attendance?: number;
  hrm_salaries?: number;
  hrm_cash_flow?: number;
  hrm_all_cash_flow?: number;
  hrm_loans?: number;
  hrm_all_loans?: number;
  hrm_documents?: number;
  hrm_all_documents?: number;
  hrm_exits?: number;
  hrm_all_exits?: number;
  hrm_self_service?: number;
  procurement?: number;
  suppliers?: number;
  product_bundles?: number;
  product_attributes?: number;
  product_recommendations?: number;
  homepage_videos?: number;
  wholesale_orders?: number;
  order_returns?: number;
  invoices?: number;
  incomplete_orders?: number;
  ai_calling_logs?: number;
  customer_followups?: number;
  customer_segmentation?: number;
  capital?: number;
  flash_sales?: number;
  reports_inventory?: number;
  supplier_report?: number;
  auto_order?: number;
  user_behaviour_logs?: number;
  packaging_team?: number;
  pending_returns?: number;
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
  "wholesale_orders",
  "invoices",
  "incomplete_orders",
  "ai_calling_logs",
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

export const HRM_MODULE_KEYS: (keyof PageAccess)[] = [
  "hrm_overview",
  "hrm_leaderboard",
  "hrm_department_performance",
  "hrm_upsells",
  "hrm_tasks",
  "hrm_org_tree",
  "hrm_employees",
  "hrm_attendance",
  "hrm_salaries",
  "hrm_cash_flow",
  "hrm_loans",
  "hrm_documents",
  "hrm_exits",
  "hrm_self_service",
];

export function hasModuleAccess(user: any, module: string): boolean {
  if (!user || !user.role) return false;

  const pageAccess = user.role.page_access || user.role.pageAccess;

  // 1. If pageAccess exists, explicitly check the module's toggle first
  if (pageAccess) {
    // Special alias match for pending returns / order returns
    if (module === "pending_returns" || module === "order_returns") {
      const pRet = pageAccess.pending_returns;
      const oRet = pageAccess.order_returns;
      if (pRet === 1 || oRet === 1) return true;
      if (pRet === 0 && (oRet === 0 || oRet === undefined)) return false;
      if (oRet === 0 && (pRet === 0 || pRet === undefined)) return false;
    }

    const rawVal = pageAccess[module as keyof PageAccess];

    // If explicitly disabled (0), ALWAYS block access (even if user is Admin or has all_orders)
    if (rawVal === 0) {
      return false;
    }

    // If explicitly enabled (1), grant access
    if (rawVal === 1) {
      return true;
    }
  }

  // 2. Admin fallback: only if not explicitly set to 0 in pageAccess
  if (user.role.role_name === "Admin") {
    if (pageAccess && pageAccess[module as keyof PageAccess] === 0) {
      return false;
    }
    return true;
  }

  if (!pageAccess) return false;

  // 3. all_orders check for connected secondary modules (reports, history, invoices, etc.)
  // Note: "orders", "packaging_team", and "pending_returns" are NOT in ORDER_CONNECTED_MODULES
  if (pageAccess.all_orders === 1 && ORDER_CONNECTED_MODULES.includes(module)) {
    return true;
  }

  // 4. Parent HRM menu check: accessible if master 'hrm' is 1 OR any specific HRM sub-module is 1
  if (module === "hrm") {
    if (pageAccess.hrm === 1) return true;
    return HRM_MODULE_KEYS.some((key) => pageAccess[key] === 1);
  }

  // 5. If role has All User Access for a submodule, it implies page access as well
  if (module.startsWith("hrm_") && !module.startsWith("hrm_all_")) {
    const allKey = `hrm_all_${module.replace("hrm_", "")}` as keyof PageAccess;
    if (pageAccess[allKey] === 1) return true;
  }

  return false;
}

export function hasAllUserAccess(user: any, module: string): boolean {
  if (!user || !user.role) return false;
  if (user.role.role_name === "Admin") return true;
  const pageAccess = user.role.page_access || user.role.pageAccess;
  if (!pageAccess) return false;

  const key = module.startsWith("hrm_all_")
    ? module
    : module.startsWith("hrm_")
    ? `hrm_all_${module.replace("hrm_", "")}`
    : `hrm_all_${module}`;

  return pageAccess[key as keyof PageAccess] === 1;
}
