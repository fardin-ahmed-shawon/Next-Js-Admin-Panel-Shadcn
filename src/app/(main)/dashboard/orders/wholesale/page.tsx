"use client";

import * as React from "react";

import Link from "next/link";

import { CalendarIcon, Ellipsis, FileDown, FileText, Plus, Printer, RefreshCw, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useOrders } from "@/hooks/useOrders";
import { format, subDays, subMonths, startOfYear } from "date-fns";

import { OrderStats } from "../_components/order-stats";
import { OrdersTable } from "../_components/orders-table";
import { OrderContext } from "../page";

/* ---- Time range helpers ---- */

type TimeRange = "daily" | "yesterday" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "alltime" | "custom";

function getDateFrom(range: TimeRange): string {
  const now = new Date();
  const d = new Date(now);
  console.log("now:", now);
  console.log("d:", d);
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
  daily: "Today",
  yesterday: "Yesterday",
  weekly: "Weekly",
  monthly: "Monthly",
  "4months": "Last 4 Months",
  "6months": "Last 6 Months",
  yearly: "Yearly",
  custom: "Custom Range",
};



export default function WholesaleOrdersPage() {
  const [allOrdersToggle, setAllOrdersToggle] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState<TimeRange>("alltime");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("Pending");
  const [paymentFilter, setPaymentFilter] = React.useState("All");
  const [courierFilter, setCourierFilter] = React.useState("All");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);

  const handleSetStatusFilter = React.useCallback((status: string) => {
    setStatusFilter(status);
    if (status === "Pending" || status === "Ready To Ship" || status === "Hold" || status === "Ship Later" || status === "Pre-Order") {
      setTimeRange("alltime");
    } else {
      setTimeRange("daily");
    }
  }, []);

  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const params = React.useMemo(() => {
    const p: any = {
      page,
      per_page: perPage,
      search: debouncedSearch,
      status: statusFilter,
      payment_status: paymentFilter,
      courier: courierFilter,
      all_orders: allOrdersToggle,
      isWholesale: true,
    };

    const now = new Date();
    if (timeRange !== "alltime" && timeRange !== "custom") {
      let fromDate = null;
      if (timeRange === "daily") fromDate = now;
      else if (timeRange === "yesterday") fromDate = subDays(now, 1);
      else if (timeRange === "weekly") fromDate = subDays(now, 7);
      else if (timeRange === "monthly") fromDate = subMonths(now, 1);
      else if (timeRange === "4months") fromDate = subMonths(now, 4);
      else if (timeRange === "6months") fromDate = subMonths(now, 6);
      else if (timeRange === "yearly") fromDate = startOfYear(now);

      if (fromDate) {
        if (timeRange === "yesterday") {
          p.start_date = format(fromDate, "yyyy-MM-dd");
          p.end_date = format(fromDate, "yyyy-MM-dd");
        } else {
          p.start_date = format(fromDate, "yyyy-MM-dd");
          p.end_date = format(now, "yyyy-MM-dd");
        }
      }
    } else if (timeRange === "custom") {
      if (customFrom) p.start_date = customFrom;
      if (customTo) p.end_date = customTo;
    }

    return p;
  }, [page, perPage, debouncedSearch, statusFilter, paymentFilter, courierFilter, allOrdersToggle, timeRange, customFrom, customTo]);

  const { orders, summary, pagination, isLoading } = useOrders(params);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";

  const getImageUrl = React.useCallback(
    (path: string | null) => {
      if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
      if (path.startsWith("http")) return path;
      return `${baseUrl}${path.startsWith("/") ? path.slice(1) : path}`;
    },
    [baseUrl],
  );

  const mappedOrders = React.useMemo(() => {
    if (!orders) return [];
    return orders
      .filter((order: any) => order.order_status !== "Incomplete")
      .map((order: any) => {
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

        // Remove 'Z' so JS parses it as local time, avoiding double timezone offset addition
        const rawDateStr = order.created_at ? order.created_at.replace("Z", "") : "";
        const createdDate = new Date(rawDateStr);

        const year = createdDate.getFullYear();
        const month = String(createdDate.getMonth() + 1).padStart(2, "0");
        const day = String(createdDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        const timeString = createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const initials =
          (order.customer_full_name || "Unknown")
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";
        const avatarUrl = `https://placehold.co/40x40/1a1a2e/e0e0e0?text=${initials}`;

        const assignedEmployee =
          order.employee_orders?.[0]?.user?.full_name || order.employeeOrders?.[0]?.user?.full_name || null;

        return {
          id: order.order_no,
          customer: order.customer_full_name || "Unknown",
          phone: order.customer_phone || "",
          shippingAddress: order.customer_shipping_address || "",
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
          source: order.source || null,
          avatar: avatarUrl,
          category: mainCategory,
          subCategory: subCategory,
          productImages: productImages,
          orderedProducts: mappedProducts,
          parcelStatus: "",
          courier: "",
          steadfast_parcel: order.steadfast_parcel || order.steadfastParcel || null,
          pathao_parcel: order.pathao_parcel || order.pathaoParcel || null,
          redx_parcel: order.redx_parcel || order.redxParcel || null,
          courier_details: order.courier_details || null,
          assignedEmployee: assignedEmployee,
          parcelHistory: {
            total: order.customer?.parcel_history?.total || 0,
            delivered: order.customer?.parcel_history?.delivered || 0,
            cancelled: order.customer?.parcel_history?.cancelled || 0,
            successRate: order.customer?.parcel_history?.success_rate || "0",
          },
          previousOrdersCountByPhone: order.previous_orders_count_by_phone || 0,
          ipAddress: order.customer_ip_address || "—",
          createdAt: order.created_at,
          is_ai_called: order.is_ai_called || false,
          invoice_status: order.invoice_status || "Not Invoiced",
        };
      });
  }, [orders, getImageUrl]);

  if (isLoading && !orders?.length) {
    return <OrdersSkeleton />;
  }

  return (
    <OrderContext.Provider value={{ params, searchQuery, setSearchQuery, statusFilter, setStatusFilter: handleSetStatusFilter, paymentFilter, setPaymentFilter, courierFilter, setCourierFilter, page, setPage, perPage, setPerPage, timeRange, setTimeRange, customFrom, setCustomFrom, customTo, setCustomTo, pagination, summary }}>
      <div className="flex flex-col gap-6 w-full">
        {/* Header + Toolbar combined */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: Title + description (hidden on mobile, shown on sm+) */}
          <div className="space-y-1 hidden sm:block">
            <h1 className="text-3xl tracking-tight">Wholesale Orders</h1>
            <p className="text-muted-foreground text-sm">Track, manage, and fulfill all wholesale orders.</p>
          </div>

          {/* Mobile: Title shown above */}
          <div className="space-y-1 sm:hidden">
            <h1 className="text-2xl tracking-tight">Wholesale Orders</h1>
            <p className="text-muted-foreground text-sm">Track, manage, and fulfill all wholesale orders.</p>
          </div>

          {/* Controls: on mobile = full-width row (Create Order left, period+3dot right). On desktop = stacked column on right */}
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              {/* Create Order button */}
              <Button size="sm" asChild>
                <Link href="/dashboard/orders/create">
                  <Plus className="mr-2 size-4" />
                  Create Order
                </Link>
              </Button>

              {/* Period select + 3-dot */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border rounded-[min(var(--radius-md),12px)] px-3 h-9 bg-background select-none">
                  <Switch id="all-orders-toggle" checked={allOrdersToggle} onCheckedChange={setAllOrdersToggle} />
                  <Label htmlFor="all-orders-toggle" className="text-xs font-semibold cursor-pointer whitespace-nowrap">
                    All Orders
                  </Label>
                </div>

                <Select value={timeRange} onValueChange={(v) => { setTimeRange(v as TimeRange); setPage(1); }}>
                  <SelectTrigger className="w-32 sm:w-36">
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

                {/* Custom date inputs â€” inline on desktop only */}
                {timeRange === "custom" && (
                  <div className="hidden sm:flex items-center gap-2">
                    <CalendarIcon className="size-4 text-muted-foreground" />
                    <Input
                      type="date"
                      className="h-8 w-36 text-xs"
                      value={customFrom}
                      onChange={(e) => { setCustomFrom(e.target.value); setPage(1); }}
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="date"
                      className="h-8 w-36 text-xs"
                      value={customTo}
                      onChange={(e) => { setCustomTo(e.target.value); setPage(1); }}
                    />
                  </div>
                )}

                {/* 3-dot actions menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline" aria-label="More order actions">
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Bulk Invoice</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => { }}>
                        <FileText className="mr-2 size-4" />
                        All Invoice A4
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { }}>
                        <Printer className="mr-2 size-4" />
                        All Parcel Invoice
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Management</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => { }}>
                        <ShieldOff className="mr-2 size-4" />
                        Block List
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { }}>
                        <RefreshCw className="mr-2 size-4" />
                        Refresh
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { }}>
                        <FileDown className="mr-2 size-4" />
                        Export Report
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Custom date inputs â€” own row on mobile only */}
            {timeRange === "custom" && (
              <div className="flex sm:hidden items-center gap-2 w-full">
                <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
                <Input
                  type="date"
                  className="h-8 flex-1 text-xs"
                  value={customFrom}
                  onChange={(e) => { setCustomFrom(e.target.value); setPage(1); }}
                />
                <span className="text-xs text-muted-foreground shrink-0">to</span>
                <Input
                  type="date"
                  className="h-8 flex-1 text-xs"
                  value={customTo}
                  onChange={(e) => { setCustomTo(e.target.value); setPage(1); }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats driven by server summary */}
        <OrderStats />

        {/* Table driven by mappedOrders */}
        <div className="w-full min-w-0">
          <OrdersTable data={mappedOrders} useServerPagination={true} />
        </div>
      </div>
    </OrderContext.Provider>
  );
}

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            <Skeleton className="h-7 w-16 rounded" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border bg-card">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between p-4 border-b">
          <Skeleton className="h-8 w-52 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
        {/* Table Content */}
        <div className="p-4 space-y-4">
          <div className="flex justify-between border-b pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20 rounded" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

