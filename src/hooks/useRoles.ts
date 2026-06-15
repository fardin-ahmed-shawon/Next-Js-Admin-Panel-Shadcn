import { useEffect, useState } from "react";

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
  payments: number;
  accounts: number;
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
        const res = await fetch(API_URL);
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
