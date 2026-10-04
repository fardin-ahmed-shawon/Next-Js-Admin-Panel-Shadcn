import useSWR from 'swr';
import { fetchClient } from "@/lib/fetch-client";

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error('An error occurred while fetching the report.');
  }
  return res.json();
};

export interface IncompleteReportSummary {
  total_incomplete_orders: number;
  total_incomplete_placed?: number;
  still_incomplete_orders?: number;
  total_completed_orders: number;
  conversion_rate: number;
  extra_earned_value: number;
  average_order_value: number;
  avg_conversion_time: string;
}

export interface IncompleteReportBreakdownItem {
  period_key: string;
  label: string;
  completed_count: number;
  incomplete_count: number;
  total_incomplete_placed?: number;
  still_incomplete_count?: number;
  conversion_rate: number;
  earned_value: number;
  avg_order_value: number;
}

export interface IncompleteReportEmployeeItem {
  user_id: number;
  employee_name: string;
  completed_count: number;
  earned_value: number;
  avg_value: number;
}

export interface UseIncompleteReportOptions {
  period?: string;
  start_date?: string;
  end_date?: string;
  date_type?: 'completed_at' | 'created_at';
  employee_id?: number | string;
  all_orders?: boolean;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export function useIncompleteReport(options?: UseIncompleteReportOptions) {
  const queryParams = new URLSearchParams();

  if (options?.period) queryParams.append('period', options.period);
  if (options?.start_date) queryParams.append('start_date', options.start_date);
  if (options?.end_date) queryParams.append('end_date', options.end_date);
  if (options?.date_type) queryParams.append('date_type', options.date_type);
  if (options?.employee_id && options.employee_id !== 'all') queryParams.append('employee_id', String(options.employee_id));
  if (options?.all_orders) queryParams.append('all_orders', '1');
  if (options?.page) queryParams.append('page', options.page.toString());
  if (options?.per_page) queryParams.append('per_page', options.per_page.toString());
  if (options?.sort_by) queryParams.append('sort_by', options.sort_by);
  if (options?.sort_dir) queryParams.append('sort_dir', options.sort_dir);

  const queryString = queryParams.toString();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const endpoint = "incomplete-orders/report";
  const url = queryString ? `${baseUrl}${endpoint}?${queryString}` : `${baseUrl}${endpoint}`;

  const { data, error, mutate, isLoading } = useSWR(url, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  return {
    period: data?.period || options?.period || 'monthly',
    periodLabel: data?.period_label || '',
    dateType: data?.date_type || options?.date_type || 'completed_at',
    summary: data?.summary as IncompleteReportSummary | undefined,
    breakdown: (data?.breakdown || []) as IncompleteReportBreakdownItem[],
    employeeBreakdown: (data?.employee_breakdown || []) as IncompleteReportEmployeeItem[],
    orders: data?.orders?.data || [],
    pagination: data?.orders ? {
      current_page: data.orders.current_page,
      last_page: data.orders.last_page,
      per_page: data.orders.per_page,
      total: data.orders.total,
    } : null,
    isLoading: isLoading || (!error && !data),
    isError: error,
    mutate,
  };
}
