import { useEffect, useState } from "react";
import { Role } from "./useRoles";
import { fetchClient } from "@/lib/fetch-client";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_USERS || "users"}`;

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  role_id: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  role?: Role;
}

interface UsersApiResponse {
  success: boolean;
  message: string;
  data: User[];
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchClient(API_URL);
      if (!res.ok) throw new Error("Failed to fetch users");
      const result: UsersApiResponse = await res.json();

      setUsers(result.data || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, setUsers, refetch: fetchUsers };
}
