import { useState, useCallback } from "react";
import { toast } from "sonner";
import { fetchClient } from "@/lib/fetch-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface AutoOrderPriority {
  id: number;
  user_id: number;
  status: "active" | "inactive";
  customer_type?: "all" | "new" | "old";
  user: {
    id: number;
    full_name: string;
    email?: string;
    phone?: string;
    role_id: number;
    employee_detail?: {
      id: number;
      department_id?: number;
      designation_id?: number;
      department?: { id: number; name: string; code?: string };
      designation?: { id: number; title: string; grade?: string };
    } | null;
  };
}

export function useAutoOrder() {
  const [priorities, setPriorities] = useState<AutoOrderPriority[]>([]);
  const [isAutoOrderEnabled, setIsAutoOrderEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPriorities = useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoint = API_BASE_URL.endsWith("/") ? `${API_BASE_URL}auto-order-priorities` : `${API_BASE_URL}/auto-order-priorities`;
      const res = await fetchClient(endpoint);
      if (res.ok) {
        const response = await res.json();
        if (response.success) {
          setPriorities(response.data);
          setIsAutoOrderEnabled(response.auto_order === "1");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load auto order priorities");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleAutoOrder = async (enabled: boolean) => {
    try {
      const endpoint = API_BASE_URL.endsWith("/") ? `${API_BASE_URL}auto-order/toggle` : `${API_BASE_URL}/auto-order/toggle`;
      const res = await fetchClient(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto_order: enabled ? "1" : "0" }),
      });
      if (res.ok) {
        const response = await res.json();
        if (response.success) {
          setIsAutoOrderEnabled(enabled);
          toast.success(response.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to toggle auto order");
    }
  };

  const addPriority = async (
    userId: number,
    status: "active" | "inactive",
    customerType: "all" | "new" | "old" = "all"
  ) => {
    try {
      const endpoint = API_BASE_URL.endsWith("/") ? `${API_BASE_URL}auto-order-priorities` : `${API_BASE_URL}/auto-order-priorities`;
      const res = await fetchClient(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, status, customer_type: customerType }),
      });
      if (res.ok) {
        const response = await res.json();
        if (response.success) {
          toast.success(response.message);
          fetchPriorities();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(error);
      toast.error("Failed to add user to auto order priorities");
      return false;
    }
  };

  const updatePriorityStatus = async (id: number, status: "active" | "inactive") => {
    try {
      const endpoint = API_BASE_URL.endsWith("/") ? `${API_BASE_URL}auto-order-priorities/${id}` : `${API_BASE_URL}/auto-order-priorities/${id}`;
      const res = await fetchClient(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const response = await res.json();
        if (response.success) {
          setPriorities(prev =>
            prev.map(p => (p.id === id ? { ...p, status } : p))
          );
          toast.success(response.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const updatePriorityCustomerType = async (id: number, customerType: "all" | "new" | "old") => {
    try {
      const endpoint = API_BASE_URL.endsWith("/") ? `${API_BASE_URL}auto-order-priorities/${id}` : `${API_BASE_URL}/auto-order-priorities/${id}`;
      const res = await fetchClient(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_type: customerType }),
      });
      if (res.ok) {
        const response = await res.json();
        if (response.success) {
          setPriorities(prev =>
            prev.map(p => (p.id === id ? { ...p, customer_type: customerType } : p))
          );
          toast.success(response.message || "Customer segment updated successfully");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update customer segment");
    }
  };

  const deletePriority = async (id: number) => {
    try {
      const endpoint = API_BASE_URL.endsWith("/") ? `${API_BASE_URL}auto-order-priorities/${id}` : `${API_BASE_URL}/auto-order-priorities/${id}`;
      const res = await fetchClient(endpoint, {
        method: "DELETE",
      });
      if (res.ok) {
        const response = await res.json();
        if (response.success) {
          setPriorities(prev => prev.filter(p => p.id !== id));
          toast.success(response.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    }
  };

  return {
    priorities,
    isAutoOrderEnabled,
    isLoading,
    fetchPriorities,
    toggleAutoOrder,
    addPriority,
    updatePriorityStatus,
    updatePriorityCustomerType,
    deletePriority,
  };
}
