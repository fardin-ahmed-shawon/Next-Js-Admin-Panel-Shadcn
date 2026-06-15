import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}employee-orders`;

export interface EmployeeOrder {
  id: number;
  user_id: number;
  order_no: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    full_name: string;
  };
}

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
};

export function useEmployeeOrders() {
  const { data, error, isLoading, mutate } = useSWR(API_URL, fetcher, {
    revalidateOnFocus: false,
  });

  const createAssignment = async (payload: { user_id: number; order_no: string }) => {
    const res = await fetchClient(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to assign order");
    mutate();
    return res.json();
  };

  const updateAssignment = async (id: number, payload: { order_no: string }) => {
    const res = await fetchClient(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update assignment");
    mutate();
    return res.json();
  };

  const deleteAssignment = async (id: number) => {
    const res = await fetchClient(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete assignment");
    mutate();
    return res.json();
  };

  return {
    data: data?.data as EmployeeOrder[] || [],
    error,
    isLoading,
    mutate,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
}
