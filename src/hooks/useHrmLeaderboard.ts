import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

export interface LeaderboardEmployee {
  user_id: number;
  name: string;
  email: string;
  avatar: string;
  department_id: number | null;
  department_name: string;
  designation_id: number | null;
  designation_title: string;
  total_assigned: number;
  status_counts: {
    pending: number;
    confirmed: number;
    ready_to_ship: number;
    in_courier: number;
    delivered: number;
    returned: number;
    cancelled: number;
    hold: number;
  };
  delivered_count: number;
  delivery_rate: number;
  delivered_revenue: number;
  total_order_value: number;
  upsell_count: number;
  upsell_total: number;
  performance_score: number;
  rank: number;
}

export interface DepartmentSummary {
  department_id: number;
  department_name: string;
  employee_count: number;
  total_assigned: number;
  total_delivered: number;
  total_delivered_revenue: number;
  total_upsell: number;
  top_performer: {
    user_id: number;
    name: string;
    avatar: string;
    score: number;
  } | null;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEmployee[];
  top_podium: LeaderboardEmployee[];
  departments: { id: number; name: string }[];
  department_summaries: DepartmentSummary[];
  total_participants: number;
}

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) {
    throw new Error("Failed to load leaderboard data");
  }
  const json = await res.json();
  return json.data as LeaderboardResponse;
};

export function useHrmLeaderboard(params?: {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  sortBy?: string;
}) {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}hrm/leaderboard`;
  const searchParams = new URLSearchParams();

  if (params?.startDate) searchParams.append("start_date", params.startDate);
  if (params?.endDate) searchParams.append("end_date", params.endDate);
  if (params?.departmentId && params.departmentId !== "all") searchParams.append("department_id", params.departmentId);
  if (params?.sortBy) searchParams.append("sort_by", params.sortBy);

  const url = searchParams.toString() ? `${baseUrl}?${searchParams.toString()}` : baseUrl;

  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}
