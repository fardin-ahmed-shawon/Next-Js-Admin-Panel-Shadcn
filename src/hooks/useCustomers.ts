import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    try {
      // @ts-ignore
      error.info = await res.json();
    } catch {
      // @ts-ignore
      error.info = { message: res.statusText };
    }
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export function useCustomers(report = false) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const customersEndpoint = report ? "reports/customers" : process.env.NEXT_PUBLIC_API_WEB_CUSTOMERS || "customers";

  const url = `${baseUrl}${customersEndpoint}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

export function useCustomer(id: string | number | undefined) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const url = id ? `${baseUrl}customers/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    customer: data?.data || null,
    crmStats: data?.crm_stats || null,
    addresses: data?.addresses || [],
    raw: data,
    error,
    isLoading,
    mutate,
  };
}

export async function updateCustomer(id: string | number, payload: Record<string, any>) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const res = await fetchClient(`${baseUrl}customers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update customer");
  }

  return res.json();
}

export async function addCustomerNote(
  customerId: string | number,
  payload: { note: string; type?: string; admin_name?: string }
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const res = await fetchClient(`${baseUrl}customers/${customerId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to add note");
  }

  return res.json();
}

export async function deleteCustomerNote(customerId: string | number, noteId: string | number) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const res = await fetchClient(`${baseUrl}customers/${customerId}/notes/${noteId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete note");
  }

  return res.json();
}

export async function updateCustomerTags(customerId: string | number, tags: string[]) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const res = await fetchClient(`${baseUrl}customers/${customerId}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tags }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update tags");
  }

  return res.json();
}
