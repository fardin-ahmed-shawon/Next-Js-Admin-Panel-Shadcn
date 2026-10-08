"use client";

import * as React from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CustomersStats } from "./_components/customers-stats";
import { CustomerRow, CustomersTable } from "./_components/customers-table";

export default function CustomersPage() {
  const [orderDateFrom, setOrderDateFrom] = React.useState("");
  const [orderDateTo, setOrderDateTo] = React.useState("");
  const [dateFilters, setDateFilters] = React.useState<{ order_date_from?: string; order_date_to?: string }>({});
  const { data: response, isLoading, error, mutate } = useCustomers(false, dateFilters);
  const invalidRange = Boolean(orderDateFrom && orderDateTo && orderDateFrom > orderDateTo);

  if (isLoading && !response) {
    return (
      <div className="flex h-[450px] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading Customer Intelligence Directory...</p>
      </div>
    );
  }

  if (error && !response) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-3">
        <p className="text-destructive font-medium">Failed to load customer directory.</p>
        <Button variant="outline" size="sm" onClick={() => mutate()} className="gap-2">
          <RefreshCw className="size-4" /> Try Again
        </Button>
      </div>
    );
  }

  // Map API data to rich CustomerRow with all behavioral and transaction metrics
  const apiCustomers: any[] = response?.data || [];
  const mappedData: CustomerRow[] = apiCustomers.map((c: any) => {
    const orders = c.orders || [];
    const orderCount = c.segment_metrics?.order_count ?? orders.length;

    let spent = c.segment_metrics?.spent;
    if (spent === undefined || spent === null) {
      spent = orders.reduce((sum: number, o: any) => sum + Number(o.grand_total_amount || 0), 0);
      if (spent === 0 && c.parcel_history?.total_spent) {
        spent = Number(c.parcel_history.total_spent);
      }
    }
    spent = Number(spent || 0);

    const aov = orderCount > 0 ? Math.round(spent / orderCount) : 0;

    let productsCount = c.segment_metrics?.products_count;
    if (productsCount === undefined || productsCount === null) {
      productsCount = 0;
      orders.forEach((o: any) => {
        if (o.ordered_products && Array.isArray(o.ordered_products)) {
          o.ordered_products.forEach((p: any) => {
            productsCount += Number(p.qty || 1);
          });
        }
      });
    }

    const delivered = orders.filter((o: any) => o.order_status === "Delivered").length;
    const returned = orders.filter((o: any) =>
      ["Returned", "Partial", "Pending-Return"].includes(o.order_status) || Boolean(o.is_partial_return)
    ).length;

    let successRate = c.segment_metrics?.success_rate;
    if (successRate === undefined || successRate === null) {
      successRate = orderCount > 0 ? Math.round((delivered / orderCount) * 100) : 0;
    }

    let returnRate = c.segment_metrics?.return_rate;
    if (returnRate === undefined || returnRate === null) {
      returnRate = orderCount > 0 ? Math.round((returned / orderCount) * 100) : 0;
    }

    let lastOrderDate: string | null = c.segment_metrics?.last_order_date || null;
    let daysSinceLastOrder: number | null = c.segment_metrics?.days_since_last_order ?? null;
    if (!lastOrderDate && orders.length > 0) {
      const timestamps = orders
        .map((o: any) => new Date(o.created_at).getTime())
        .filter((t: number) => !isNaN(t));
      if (timestamps.length > 0) {
        const latestTime = Math.max(...timestamps);
        lastOrderDate = new Date(latestTime).toISOString().split("T")[0];
        const diffMs = Date.now() - latestTime;
        daysSinceLastOrder = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }
    }

    const segmentKey = c.dynamic_segment?.key || "returning";
    const segmentName = c.dynamic_segment?.name || (orderCount > 1 ? "Repeat Buyer" : orderCount === 1 ? "New Buyer" : "Standard Customer");
    const segmentColor = c.dynamic_segment?.color || (orderCount > 1 ? "#3b82f6" : "#10b981");

    const status: "Registered" = "Registered";
    const joinDate = c.created_at ? new Date(c.created_at).toISOString().split("T")[0] : "";

    // Extract District, Order IDs, and Product names for searching
    const districtSet = new Set<string>();
    if (c.district) districtSet.add(c.district.trim());
    if (c.city && c.city !== "Inside Dhaka" && c.city !== "Outside Dhaka") districtSet.add(c.city.trim());
    if (c.primary_address?.district) districtSet.add(c.primary_address.district.trim());

    const orderIds: string[] = [];
    const orderNos: string[] = [];
    const productNamesSet = new Set<string>();
    const productSkusSet = new Set<string>();

    orders.forEach((o: any) => {
      if (o.district) districtSet.add(o.district.trim());
      if (o.shipping_area) districtSet.add(o.shipping_area.trim());
      if (o.id !== undefined && o.id !== null) orderIds.push(String(o.id));
      if (o.order_no) orderNos.push(String(o.order_no));

      if (o.ordered_products && Array.isArray(o.ordered_products)) {
        o.ordered_products.forEach((op: any) => {
          if (op.product_title_snapshot) productNamesSet.add(op.product_title_snapshot.trim());
          if (op.product?.title) productNamesSet.add(op.product.title.trim());
          if (op.product?.sku) productSkusSet.add(op.product.sku.trim());
          if (op.sku_snapshot) productSkusSet.add(op.sku_snapshot.trim());
        });
      }
    });

    const primaryDistrict =
      c.district ||
      c.primary_address?.district ||
      (orders.find((o: any) => o.district)?.district) ||
      (c.city && c.city !== "Inside Dhaka" && c.city !== "Outside Dhaka" ? c.city : "") ||
      "";
    const primaryShippingArea = orders.find((o: any) => o.shipping_area)?.shipping_area || c.city || "";

    return {
      id: c.id,
      crmAssignee: c.crm_assignee?.full_name || null,
      crmManager: c.crm_manager?.full_name || null,
      name: c.full_name || "Unnamed Customer",
      email: c.email || "",
      phone: c.phone || "",
      totalOrders: orderCount,
      productsCount: Number(productsCount || 0),
      totalSpent: spent,
      aov,
      status,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name || "C")}&background=random`,
      joinDate,
      lastOrderDate,
      daysSinceLastOrder,
      successRate: Number(successRate || 0),
      returnRate: Number(returnRate || 0),
      segmentKey,
      segmentName,
      segmentColor,
      city: c.city || c.state || "",
      address: c.address || "",
      district: primaryDistrict,
      shippingArea: primaryShippingArea,
      allDistricts: Array.from(districtSet).filter(Boolean),
      orderIds,
      orderNos,
      recentOrderNo: orderNos[0] || (orderIds[0] ? `#${orderIds[0]}` : undefined),
      productNames: Array.from(productNamesSet).filter(Boolean),
      productSkus: Array.from(productSkusSet).filter(Boolean),
      notesCount: c.notes?.length || 0,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">All Customers</h1>
          <p className="text-muted-foreground text-sm">Manage your customers and CRM assignments.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border p-4" onSubmit={(event) => {
        event.preventDefault();
        if (!invalidRange) setDateFilters({ order_date_from: orderDateFrom, order_date_to: orderDateTo });
      }}>
        <div className="space-y-2">
          <Label htmlFor="order-date-from">Order date from</Label>
          <Input id="order-date-from" type="date" value={orderDateFrom} max={orderDateTo || undefined} onChange={(event) => setOrderDateFrom(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-date-to">Order date to</Label>
          <Input id="order-date-to" type="date" value={orderDateTo} min={orderDateFrom || undefined} onChange={(event) => setOrderDateTo(event.target.value)} />
        </div>
        <Button type="submit" disabled={invalidRange || isLoading}>Apply order dates</Button>
        <Button type="button" variant="outline" onClick={() => {
          setOrderDateFrom(""); setOrderDateTo(""); setDateFilters({});
        }}>Clear dates</Button>
        <p className="w-full text-xs text-muted-foreground">Includes customers with any order placed in this range. Both dates are included; customer totals show lifetime activity.</p>
        {invalidRange && <p role="alert" className="text-sm text-destructive">The end date must be on or after the start date.</p>}
        {error && <p role="alert" className="text-sm text-destructive">Could not apply the date filter. Please try again.</p>}
      </form>

      {/* Top 4 Modern KPI Cards */}
      <CustomersStats data={mappedData} />

      {/* Advanced Data-Driven Customers Table */}
      {isLoading ? <p className="text-sm text-muted-foreground">Loading customers for the selected order dates...</p>
        : !error && <CustomersTable data={mappedData} onRefresh={() => mutate()} />}
    </div>
  );
}
