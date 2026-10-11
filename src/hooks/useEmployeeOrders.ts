import { fetchClient } from "@/lib/fetch-client";
import { adminApiUrl, readAdminApiResponse } from "@/lib/admin-api";
import useSWR from "swr";

const API_URL = adminApiUrl("employee-orders");

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
  return readAdminApiResponse(res);
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
    const result = await readAdminApiResponse(res);
    mutate();
    return result;
  };

  const updateAssignment = async (id: number, payload: { user_id: number; order_no: string }) => {
    const res = await fetchClient(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await readAdminApiResponse(res);
    mutate();
    return result;
  };

  const deleteAssignment = async (id: number) => {
    const res = await fetchClient(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    const result = await readAdminApiResponse(res);
    mutate();
    return result;
  };

  return {
    data: (data?.data as EmployeeOrder[]) || [],
    error,
    isLoading,
    mutate,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
}
