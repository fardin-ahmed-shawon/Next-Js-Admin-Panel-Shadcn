"use client";

import { useCustomers } from "@/hooks/useCustomers";
import { Loader2 } from "lucide-react";

import { CustomersStats } from "./_components/customers-stats";
import { CustomerRow, CustomersTable } from "./_components/customers-table";

export default function CustomersPage() {
  const { data: response, isLoading, error } = useCustomers();

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
        <p className="text-destructive">Failed to load customers.</p>
      </div>
    );
  }

  // Map API data to CustomerRow
  const apiCustomers = response?.data || [];
  const mappedData: CustomerRow[] = apiCustomers.map((c: any) => ({
    id: c.id,
    name: c.full_name,
    email: c.email || "",
    phone: c.phone || "",
    totalOrders: c.parcel_history?.total || 0,
    totalSpent: c.parcel_history?.total_spent || 0,
    // For demo purposes, we consider active users with a password as 'Registered', 
    // otherwise 'Guest'. Or simply if status is active, they are registered.
    status: c.password ? "Registered" : "Guest",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name)}&background=random`,
    joinDate: new Date(c.created_at).toISOString().split("T")[0],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">All Customers</h1>
          <p className="text-muted-foreground text-sm">Manage your customer base and track engagement.</p>
        </div>
      </div>

      <CustomersStats data={mappedData} />
      <CustomersTable data={mappedData} />
    </div>
  );
}
