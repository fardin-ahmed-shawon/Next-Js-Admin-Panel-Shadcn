"use client";

import * as React from "react";

import { CalendarIcon, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrders } from "@/hooks/useOrders";

import { SalesReportsDistrictAnalysis } from "./_components/sales-reports-district-analysis";
import { SalesReportsOrderHistory } from "./_components/sales-reports-order-history";
import { SalesReportsStats } from "./_components/sales-reports-stats";
import { SalesReportsTopCustomers } from "./_components/sales-reports-top-customers";
import { SalesReportsTopProducts } from "./_components/sales-reports-top-products";
import { SalesReportsTransactions } from "./_components/sales-reports-transactions";

type TimeRange = "alltime" | "daily" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "custom";

function getDateFrom(range: TimeRange): string {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case "daily":
      return now.toISOString().slice(0, 10);
    case "weekly":
      d.setDate(d.getDate() - 7);
      return d.toISOString().slice(0, 10);
    case "monthly":
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().slice(0, 10);
    case "4months":
      d.setMonth(d.getMonth() - 4);
      return d.toISOString().slice(0, 10);
    case "6months":
      d.setMonth(d.getMonth() - 6);
      return d.toISOString().slice(0, 10);
    case "yearly":
      d.setFullYear(d.getFullYear() - 1);
      return d.toISOString().slice(0, 10);
    default:
      return "";
  }
}

const rangeLabels: Record<TimeRange, string> = {
  alltime: "All Time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  "4months": "Last 4 Months",
  "6months": "Last 6 Months",
  yearly: "Yearly",
  custom: "Custom Range",
};

export default function ReportsDashboardPage() {
  const { orders, isLoading } = useOrders({ per_page: 1000, report: true });
  const [timeRange, setTimeRange] = React.useState<TimeRange>("alltime");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";

  const getImageUrl = React.useCallback(
    (path: string | null) => {
      if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
      if (path.startsWith("http")) return path;
      return `${baseUrl}${path.startsWith("/") ? path.slice(1) : path}`;
    },
    [baseUrl],
  );

  const allOrders = React.useMemo(() => {
    if (!orders) return [];
    return orders.map((order: any) => {
      const itemsCount = order.ordered_products?.reduce((s: number, p: any) => s + p.qty, 0) || 0;
      const paidAmount = order.payments?.reduce((s: number, p: any) => s + Number(p.paid_amount), 0) || 0;
      const paymentMethod = order.payments?.[0]?.payment_method || "COD";

      const mappedProducts =
        order.ordered_products?.map((p: any) => ({
          id: p.id || p.product_id,
          image: getImageUrl(p.product?.product_thumbnail_img),
          name: p.product?.product_name || p.product?.title || "Unknown Product",
          size: p.size_label || "—",
          color: p.color_label || "—",
          qty: p.qty || 1,
          price: p.unit_price || 0,
        })) || [];
      const productImages = mappedProducts.map((p: any) => p.image);

      const mainCategory = order.ordered_products?.[0]?.product?.main_category?.name || "Uncategorized";
      const subCategory = order.ordered_products?.[0]?.product?.sub_category?.name || "Uncategorized";

      const createdDate = new Date(order.created_at);
      const dateString = createdDate.toISOString().slice(0, 10);
      const timeString = createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const initials =
        (order.customer_full_name || "Unknown")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "U";
      const avatarUrl = `https://placehold.co/40x40/1a1a2e/e0e0e0?text=${initials}`;

      return {
        id: order.order_no,
        customer: order.customer_full_name || "Unknown",
        phone: order.customer_phone || "",
        items: itemsCount,
        total: order.grand_total_amount || 0,
        paid: paidAmount,
        due: (order.grand_total_amount || 0) - paidAmount,
        orderStatus: order.order_status || "Pending",
        paymentStatus: order.payment_status || "Unpaid",
        paymentMethod: paymentMethod,
        date: dateString,
        time: timeString,
        orderType: "regular",
        avatar: avatarUrl,
        category: mainCategory,
        subCategory: subCategory,
        productImages: productImages,
        orderedProducts: mappedProducts,
        parcelStatus: "",
        courier: "",
        district: order.district || "Unassigned",
        parcelHistory: {
          total: order.customer?.parcel_history?.total || 0,
          delivered: order.customer?.parcel_history?.delivered || 0,
          cancelled: order.customer?.parcel_history?.cancelled || 0,
          successRate: order.customer?.parcel_history?.success_rate || "0",
        },
      };
    });
  }, [orders, getImageUrl]);

  const filteredByTime = React.useMemo(() => {
    if (timeRange === "alltime") return allOrders;
    if (timeRange === "custom") {
      return allOrders.filter((o: any) => {
        if (customFrom && o.date < customFrom) return false;
        if (customTo && o.date > customTo) return false;
        return true;
      });
    }
    const from = getDateFrom(timeRange);
    return allOrders.filter((o: any) => o.date >= from);
  }, [allOrders, timeRange, customFrom, customTo]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Reports Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Analyze your sales data, revenue trends, and payment distributions.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-32 bg-background sm:w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(rangeLabels) as TimeRange[])
                    .filter((r) => r !== "custom")
                    .map((r) => (
                      <SelectItem key={r} value={r}>
                        {rangeLabels[r]}
                      </SelectItem>
                    ))}
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {timeRange === "custom" && (
              <div className="hidden items-center gap-2 sm:flex">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="h-9 w-36 text-xs"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <span className="text-muted-foreground text-xs">to</span>
                <Input
                  type="date"
                  className="h-9 w-36 text-xs"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            )}

            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </div>

          {timeRange === "custom" && (
            <div className="mt-2 flex w-full items-center gap-2 sm:hidden">
              <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
              <Input
                type="date"
                className="h-9 flex-1 text-xs"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span className="shrink-0 text-muted-foreground text-xs">to</span>
              <Input
                type="date"
                className="h-9 flex-1 text-xs"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          )}

          <Button variant="outline" size="sm" className="mt-2 w-full sm:hidden">
            <Download className="mr-2 size-4" />
            Export Report
          </Button>
        </div>
      </div>

      <SalesReportsStats data={filteredByTime} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SalesReportsTopProducts data={filteredByTime} />
        <SalesReportsTopCustomers data={filteredByTime} />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SalesReportsOrderHistory data={filteredByTime} />
        <SalesReportsTransactions data={filteredByTime} />
      </div>
      <div className="w-full">
        <SalesReportsDistrictAnalysis data={filteredByTime} />
      </div>
    </div>
  );
}
