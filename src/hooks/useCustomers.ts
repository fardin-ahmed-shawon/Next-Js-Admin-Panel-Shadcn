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
    payments: data?.payments || [],
    returns: data?.returns || [],
    allNames: data?.all_names || [],
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
  payload: {
    note: string;
    action_note?: string;
    channel?: string;
    type?: string;
    admin_name?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    next_follow_up_date?: string;
  }
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

export async function updateCustomerNote(
  customerId: string | number,
  noteId: string | number,
  payload: {
    note?: string;
    action_note?: string;
    channel?: string;
    type?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    next_follow_up_date?: string;
  }
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const res = await fetchClient(`${baseUrl}customers/${customerId}/notes/${noteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update note");
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

export async function sendCustomerSms(payload: {
  customer_id?: string | number;
  phone?: string;
  message: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const res = await fetchClient(`${baseUrl}crm/sms/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to send SMS");
  }

  return res.json();
}

export async function sendBulkSms(payload: {
  customer_ids?: (string | number)[];
  phones?: string[];
  message: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const res = await fetchClient(`${baseUrl}crm/sms/send-bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to send bulk SMS");
  }

  return res.json();
}

export function useFollowUps(params?: {
  status?: string;
  type?: string;
  channel?: string;
  search?: string;
  page?: number;
  per_page?: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.type && params.type !== "all") query.set("type", params.type);
  if (params?.channel && params.channel !== "all") query.set("channel", params.channel);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.per_page) query.set("per_page", String(params.per_page));

  const queryString = query.toString();
  const url = `${baseUrl}crm/follow-ups${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data: data?.data || [],
    total: data?.total || 0,
    counts: data?.counts || { all: 0, today: 0, upcoming: 0, overdue: 0, completed: 0 },
    currentPage: data?.current_page || 1,
    lastPage: data?.last_page || 1,
    perPage: data?.per_page || 20,
    error,
    isLoading,
    mutate,
  };
}

export interface CustomerSegmentRule {
  id: number;
  key: string;
  name: string;
  description?: string;
  color: string;
  priority: number;
  min_order_value?: number | null;
  max_order_value?: number | null;
  min_orders_count?: number | null;
  max_orders_count?: number | null;
  min_products_count?: number | null;
  max_products_count?: number | null;
  recency_days_min?: number | null;
  recency_days_max?: number | null;
  min_delivery_success_rate?: number | null;
  max_return_rate?: number | null;
  is_active: boolean;
}

export function useSegmentationRules() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const url = `${baseUrl}crm/segmentation-rules`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    rules: (data?.data || []) as CustomerSegmentRule[],
    error,
    isLoading,
    mutate,
  };
}

export async function updateSegmentationRule(id: number | string, payload: Partial<CustomerSegmentRule>) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const res = await fetchClient(`${baseUrl}crm/segmentation-rules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update segmentation rule");
  }
  return res.json();
}

export async function saveSegmentationRulesBulk(rules: Partial<CustomerSegmentRule>[]) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const res = await fetchClient(`${baseUrl}crm/segmentation-rules/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rules }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to save segmentation rules");
  }
  return res.json();
}

export async function resetSegmentationRules() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const res = await fetchClient(`${baseUrl}crm/segmentation-rules/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to reset segmentation rules");
  }
  return res.json();
}
