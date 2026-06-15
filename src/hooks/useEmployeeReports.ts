import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}${process.env.NEXT_PUBLIC_API_EMPLOYEE_REPORTS || "employee-reports"}`;

export interface EmployeeReportOrderProduct {
  product_id: number;
  product_name: string;
  qty: number;
  unit_price: number;
}

export interface EmployeeReportPayment {
  payment_id: number;
  payment_method: string;
  paid_amount: number;
  transaction_id: string | null;
}

export interface EmployeeReportOrder {
  order_no: string;
  order_status: string;
  payment_status: string;
  grand_total_amount: number;
  ordered_products: EmployeeReportOrderProduct[];
  payments: EmployeeReportPayment[];
}

export interface EmployeeReportData {
  user_id: number;
  full_name: string;
  email: string;
  assigned_orders_count: number;
  orders: EmployeeReportOrder[];
}

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
};

export function useEmployeeReports() {
  const { data, error, isLoading, mutate } = useSWR(API_URL, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data: data?.data as EmployeeReportData[] || [],
    error,
    isLoading,
    mutate,
  };
}
