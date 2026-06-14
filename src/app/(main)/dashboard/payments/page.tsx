"use client";

import { usePayments } from "@/hooks/usePayments";
import { Loader2 } from "lucide-react";

import { PaymentsStats } from "./_components/payments-stats";
import { PaymentItem, PaymentsTable } from "./_components/payments-table";

export default function PaymentsPage() {
  const { data: response, isLoading, error } = usePayments();

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <p className="text-destructive">Failed to load payments.</p>
      </div>
    );
  }

  const payments = response?.data || [];
  const summary = response?.summary || {};

  const mappedData: PaymentItem[] = payments.map((p: any) => ({
    id: p.id,
    orderId: p.order_no,
    account: p.acc_number || p.payment_method,
    method: p.payment_method,
    amount: Number(p.paid_amount || 0),
    date: p.created_at,
    status: p.payment_status || "Unknown",
  }));

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Payments</h1>
          <p className="text-muted-foreground text-sm">Manage your payments and transactions.</p>
        </div>
      </div>

      <PaymentsStats summary={summary} />
      <PaymentsTable data={mappedData} />
    </div>
  );
}
