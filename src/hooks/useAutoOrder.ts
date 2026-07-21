import { useState, useCallback } from "react";
import { toast } from "sonner";
import { fetchWrapper } from "@/utils/fetch-wrapper";

export interface AutoOrderPriority {
  id: number;
  user_id: number;
  status: "active" | "inactive";
  user: {
    id: number;
    name: string;
    role_id: number;
  };
}

export function useAutoOrder() {
  const [priorities, setPriorities] = useState<AutoOrderPriority[]>([]);
  const [isAutoOrderEnabled, setIsAutoOrderEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPriorities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWrapper("/auto-order-priorities");
      if (response.success) {
        setPriorities(response.data);
        setIsAutoOrderEnabled(response.auto_order === "1");
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
      const response = await fetchWrapper("/auto-order/toggle", {
        method: "POST",
        body: JSON.stringify({ auto_order: enabled ? "1" : "0" }),
      });
      if (response.success) {
        setIsAutoOrderEnabled(enabled);
        toast.success(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to toggle auto order");
    }
  };

  const addPriority = async (userId: number, status: "active" | "inactive") => {
    try {
      const response = await fetchWrapper("/auto-order-priorities", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, status }),
      });
      if (response.success) {
        toast.success(response.message);
        fetchPriorities();
        return true;
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
      const response = await fetchWrapper(`/auto-order-priorities/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (response.success) {
        setPriorities(prev =>
          prev.map(p => (p.id === id ? { ...p, status } : p))
        );
        toast.success(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const deletePriority = async (id: number) => {
    try {
      const response = await fetchWrapper(`/auto-order-priorities/${id}`, {
        method: "DELETE",
      });
      if (response.success) {
        setPriorities(prev => prev.filter(p => p.id !== id));
        toast.success(response.message);
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
    deletePriority,
  };
}
