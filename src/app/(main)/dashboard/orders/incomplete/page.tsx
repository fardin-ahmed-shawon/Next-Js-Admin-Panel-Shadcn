"use client";
import { orderDisplayLines } from "@/lib/order-combos";

import * as React from "react";
import {
  CalendarIcon,
  Clock,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { canUseAllOrdersToggle } from "@/hooks/useRoles";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModularFeatures } from "@/hooks/useModularFeatures";
import { useIncompleteOrders } from "@/hooks/useIncompleteOrders";
import { formatOrderDateTime } from "@/lib/utils";

import { OrderStats } from "../_components/order-stats";
import { OrdersTable } from "../_components/orders-table";
import { OrderContext } from "../_components/order-context";
import { IncompleteReportView } from "../../reports/incomplete/_components/incomplete-report-view";

/* ---- Time range helpers ---- */
type TimeRange = "daily" | "yesterday" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "alltime" | "custom";

function getDateFrom(range: TimeRange): string {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case "daily": return now.toISOString().slice(0, 10);
    case "weekly": d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10);
    case "monthly": d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10);
    case "4months": d.setMonth(d.getMonth() - 4); return d.toISOString().slice(0, 10);
    case "6months": d.setMonth(d.getMonth() - 6); return d.toISOString().slice(0, 10);
    case "yearly": d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10);
    default: return "";
  }
}

const rangeLabels: Record<TimeRange, string> = {
  alltime: "All Time", daily: "Today", yesterday: "Yesterday", weekly: "Weekly",
  monthly: "Monthly", "4months": "Last 4 Months", "6months": "Last 6 Months",
  yearly: "Yearly", custom: "Custom Range",
};

export default function IncompleteOrdersPage() {
  const { user } = useAuth();
  const { features } = useModularFeatures();
  const [allOrdersToggle, setAllOrdersToggle] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState<TimeRange>("alltime");
  const [customFrom, setCustomFrom] = React.useState<string>("");
  const [customTo, setCustomTo] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<"Incomplete" | "Complete" | "Report">("Incomplete");

  // Sorting state: order_time or completed_time
  const [sortBy, setSortBy] = React.useState<string>("order_time");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  // Date filtering basis: completed_at (Actual) vs created_at (Order creation)
  const [dateType, setDateType] = React.useState<"completed_at" | "created_at">("completed_at");

  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(100);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [paymentFilter, setPaymentFilter] = React.useState("All");

  // Update default sort when tab changes
  const handleTabChange = (newTab: "Incomplete" | "Complete" | "Report") => {
    setActiveTab(newTab);
    setPage(1);
    if (newTab === "Report") {
      setDateType("completed_at");
      setSortBy("completed_time");
      setSortDir("desc");
    } else if (newTab === "Complete") {
      setDateType("completed_at");
      setSortBy("completed_time");
      setSortDir("desc");
    } else if (newTab === "Incomplete") {
      setDateType("created_at");
      setSortBy("order_time");
      setSortDir("desc");
    }
  };

  const handleSetStatusFilter = React.useCallback((status: string) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleSetPaymentFilter = React.useCallback((status: string) => {
    setPaymentFilter(status);
    setPage(1);
  }, []);

  const startDate = React.useMemo(() => {
    if (timeRange === "alltime") return undefined;
    if (timeRange === "custom") return customFrom || undefined;
    if (timeRange === "yesterday") {
      const d = new Date(); d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    }
    return getDateFrom(timeRange);
  }, [timeRange, customFrom]);

  const endDate = React.useMemo(() => {
    if (timeRange === "alltime") return undefined;
    if (timeRange === "custom") return customTo || undefined;
    if (timeRange === "yesterday") {
      const d = new Date(); d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10); // today
  }, [timeRange, customTo]);

  // Fetch paginated data from endpoint
  const { orders, pagination, summary, isLoading } = useIncompleteOrders({
    tab: activeTab === "Complete" ? "complete" : "incomplete",
    page,
    per_page: perPage,
    search: searchQuery,
    all_orders: allOrdersToggle && canUseAllOrdersToggle(user),
    start_date: startDate,
    end_date: endDate,
    status: statusFilter,
    payment_status: paymentFilter,
    sort_by: sortBy,
    sort_dir: sortDir,
    date_type: dateType,
  });

  if (features?.orders_incomplete === false || String(features?.orders_incomplete) === "0") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <h2 className="text-2xl font-bold">Feature Disabled</h2>
        <p className="text-muted-foreground mt-2">The Incomplete Orders feature is currently disabled.</p>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";

  const getImageUrl = React.useCallback(
    (path: string | null) => {
      if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
      if (path.startsWith("http")) return path;
      return `${baseUrl}${path.startsWith("/") ? path.slice(1) : path}`;
    },
    [baseUrl]
  );

  const mappedOrders = React.useMemo(() => {
    if (!orders) return [];
    return orders.map((order: any) => {
      const itemsCount = orderDisplayLines(order.ordered_products).reduce((s: number, p: any) => s + p.qty, 0) || 0;
      const paidAmount = order.payments?.reduce((s: number, p: any) => s + Number(p.paid_amount), 0) || 0;
      const paymentMethod = order.payments?.[0]?.payment_method || "COD";

      const mappedProducts = orderDisplayLines(order.ordered_products).map((p: any) => ({
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

      const { date: dateString, time: timeString } = formatOrderDateTime(order.created_at);

      const initials = (order.customer_full_name || "Unknown")
        .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "U";
      const avatarUrl = `https://placehold.co/40x40/1a1a2e/e0e0e0?text=${initials}`;

      const assignedEmployee = order.employee_orders?.[0]?.user?.full_name || order.employeeOrders?.[0]?.user?.full_name || null;

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
        incompleteCompletedAt: order.incomplete_completed_at || null,
        incomplete_completed_at: order.incomplete_completed_at || null,
        durationToComplete: order.duration_to_complete || null,
        duration_to_complete: order.duration_to_complete || null,
        is_ai_called: order.is_ai_called || false,
        invoice_status: order.invoice_status || "Not Invoiced",
        order_note: order.order_note || null,
        employee_note: order.employee_note || null,
        cancelled_note: order.cancelled_note || null,
      };
    });
  }, [orders, getImageUrl]);

  const totalIncompleteOrdersCount = summary?.total_incomplete_orders_count || 0;
  const totalCompletedOrdersCount = summary?.total_completed_orders_count || 0;
  const extraEarnedValue = summary?.extra_earned_value || 0;

  if (isLoading && !orders.length && activeTab !== "Report") {
    return <OrdersSkeleton />;
  }

  // Create context to satisfy OrdersTable server pagination
  const contextValue = {
    params: {},
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter: handleSetStatusFilter,
    paymentFilter, setPaymentFilter: handleSetPaymentFilter,
    courierFilter: "All", setCourierFilter: () => {},
    page, setPage,
    perPage, setPerPage,
    timeRange, setTimeRange,
    customFrom, setCustomFrom,
    customTo, setCustomTo,
    pagination,
    summary,
  };

  return (
    <OrderContext.Provider value={contextValue}>
      <div className="flex flex-col gap-3.5 w-full">
        {/* Header + Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl tracking-tight font-bold">Incomplete Orders</h1>
            <p className="text-muted-foreground text-sm">Track, manage, recover, and analyze customer incomplete orders.</p>
            <div className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-md border border-emerald-100 dark:border-emerald-900/50 w-fit">
              Total Incomplete Orders <span className="font-bold">{totalIncompleteOrdersCount}</span>
              {summary?.still_incomplete_orders_count !== undefined && (
                <span className="font-medium text-muted-foreground"> ({summary.still_incomplete_orders_count} Still Incomplete)</span>
              )}
              , You have Completed <span className="font-bold">{totalCompletedOrdersCount}</span> Orders & earned extra <span className="font-bold">{extraEarnedValue.toLocaleString()} Tk</span> order value from incomplete orders.
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {/* All Orders toggle - only for first 2 tabs (Incomplete and Complete) */}
              {activeTab !== "Report" && canUseAllOrdersToggle(user) && (<div className="flex items-center gap-2 border rounded-[min(var(--radius-md),12px)] px-3 h-9 bg-background select-none">
                  <Switch id="all-orders-toggle" checked={allOrdersToggle} onCheckedChange={(checked) => { setAllOrdersToggle(checked); setPage(1); }} />
                  <Label htmlFor="all-orders-toggle" className="text-xs font-semibold cursor-pointer whitespace-nowrap">
                    All Orders
                  </Label>
                </div>
              )}

              {/* Time Period Selector - visible for all tabs */}
              <Select value={timeRange} onValueChange={(v) => { setTimeRange(v as TimeRange); setPage(1); }}>
                <SelectTrigger className="w-32 sm:w-36 h-9">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(rangeLabels) as TimeRange[]).filter(r => r !== "custom").map(r => (
                      <SelectItem key={r} value={r}>{rangeLabels[r]}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Date Filter basis (When on Complete tab only; Report always works in Completed Date Actual) */}
              {activeTab === "Complete" && (
                <Select
                  value={dateType}
                  onValueChange={(v: "completed_at" | "created_at") => {
                    setDateType(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-44 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed_at">
                      <span className="flex items-center gap-1 font-medium">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        Completed Date (Actual)
                      </span>
                    </SelectItem>
                    <SelectItem value="created_at">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground" />
                        Order Creation Time
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {timeRange === "custom" && (
                <div className="hidden sm:flex items-center gap-2">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <Input type="date" className="h-8 w-36 text-xs" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input type="date" className="h-8 w-36 text-xs" value={customTo} onChange={e => setCustomTo(e.target.value)} />
                </div>
              )}
            </div>

            {timeRange === "custom" && (
              <div className="flex sm:hidden items-center gap-2 w-full">
                <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
                <Input type="date" className="h-8 flex-1 text-xs" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
                <span className="text-xs text-muted-foreground shrink-0">to</span>
                <Input type="date" className="h-8 flex-1 text-xs" value={customTo} onChange={e => setCustomTo(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex w-full items-center justify-start border-b border-border/40 pb-2">
          <Tabs value={activeTab} onValueChange={(v: any) => handleTabChange(v)}>
            <TabsList>
              <TabsTrigger value="Incomplete" className="text-xs font-medium">
                Incomplete Orders
              </TabsTrigger>
              <TabsTrigger value="Complete" className="text-xs font-medium">
                Complete (Recovered Orders)
              </TabsTrigger>
              <TabsTrigger value="Report" className="text-xs font-medium gap-1.5">
                <BarChart3 className="size-3.5" />
                Actual Conversion Report
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        {activeTab === "Report" ? (
          <IncompleteReportView
            embedded={true}
            timeRange={timeRange === "alltime" ? "all_time" : (timeRange as any)}
            dateType="completed_at"
            sortBy={sortBy}
            sortDir={sortDir}
            customFrom={customFrom}
            customTo={customTo}
            allOrders={allOrdersToggle}
          />
        ) : (
          <>
            <OrderStats data={mappedOrders} />

            <div className="w-full min-w-0">
              <OrdersTable
                data={mappedOrders}
                hideOrderStatusFilter={activeTab === "Incomplete"}
                hidePaymentStatusFilter={activeTab === "Incomplete"}
                hidePaymentStatusColumn={true}
                simplifiedPaymentColumn={true}
                showIncompleteStatus={true}
                incompleteOrdersMode={activeTab === "Incomplete"}
                hideActionsColumn={activeTab === "Complete"}
                useServerPagination={true}
              />
            </div>
          </>
        )}
      </div>
    </OrderContext.Provider>
  );
}

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
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
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-4 border-b">
          <Skeleton className="h-8 w-52 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
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
