"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { mutate } from "swr";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fetchClient } from "@/lib/fetch-client";

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";

interface PrintInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderIds: string | string[] | null;
  type: "a4" | "pos" | "label" | null;
  onSuccess?: () => void;
}

export function PrintInvoiceModal({
  open,
  onOpenChange,
  orderIds,
  type,
  onSuccess,
}: PrintInvoiceModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (!orderIds || !type) return;

    setIsLoading(true);
    try {
      const payload = Array.isArray(orderIds)
        ? { order_nos: orderIds, type }
        : { order_no: orderIds, type };

      const res = await fetchClient(`${getApiBaseUrl()}invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Request failed");
      }

      // Automation: Update order status to "Ready To Ship"
      try {
        const selectedIds = Array.isArray(orderIds) ? orderIds : [orderIds];
        await fetchClient(`${getApiBaseUrl()}orders/bulk-update-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_nos: selectedIds, order_status: "Ready To Ship" }),
        });

        // Auto-refresh the orders table data globally
        const ordersEndpoint = process.env.NEXT_PUBLIC_API_WEB_ORDERS || "orders";
        mutate(
          (key: any) => {
            if (typeof key === "string") return key.includes(ordersEndpoint);
            if (Array.isArray(key)) return key.some((k) => typeof k === "string" && k.includes(ordersEndpoint));
            return false;
          },
          undefined,
          { revalidate: true }
        );
      } catch (statusErr) {
        console.warn("Failed to automatically update order status", statusErr);
      }

      toast.success("Invoice print status saved successfully");
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save invoice print status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            All invoiced Printed !
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {
            e.preventDefault();
            handleConfirm();
          }} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Yes, Invoiced Printed!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
