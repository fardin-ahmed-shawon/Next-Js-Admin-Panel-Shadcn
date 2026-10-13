"use client";

import * as React from "react";
import {
  Award,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  ExternalLink,
  Filter,
  Flame,
  History,
  Layers,
  Loader2,
  Mail,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  TrendingUp,
  User as UserIcon,
  Users,
  X,
  ArrowUpDown,
  Tag,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  useUpsellReport,
  UpsellRecord,
  UpsellProductRecord,
  UpsellEmployeeRecord,
} from "@/hooks/useUpsellReport";
import { getImageUrl, formatOrderDateTime } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { canObserveHrmTeam } from "@/hooks/useRoles";

type TimePreset = "today" | "this_week" | "this_month" | "last_month" | "all_time" | "custom";
type ViewMode = "orders" | "products" | "employees";

const timePresetLabels: Record<TimePreset, string> = {
  all_time: "All Time",
  today: "Today",
  this_week: "This Week",
  this_month: "This Month",
  last_month: "Last Month",
  custom: "Custom Range",
};

function getDateRange(preset: TimePreset): { start?: string; end?: string } {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  switch (preset) {
    case "today":
      return { start: todayStr, end: todayStr };
    case "this_week": {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return { start: d.toISOString().slice(0, 10), end: todayStr };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      return { start, end: todayStr };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      return { start, end };
    }
    case "all_time":
    default:
      return {};
  }
}

const getInitials = (name?: string) => {
  if (!name) return "U";
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
};

export interface UpsellReportViewProps {
  title?: string;
  description?: string;
}

export function UpsellReportView({
  title = "Upsell Tracking",
  description = "Track employee upsell performance, additional revenue from Delivered & Partial orders, and product gains.",
}: UpsellReportViewProps) {
  const { user } = useAuth();
  const canAccessAllUpsells = canObserveHrmTeam(user, "upsells");

  const [viewMode, setViewMode] = React.useState<ViewMode>("orders");
  const [timePreset, setTimePreset] = React.useState<TimePreset>("all_time");
  const [customStart, setCustomStart] = React.useState("");
  const [customEnd, setCustomEnd] = React.useState("");

  // Filters
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>("all");
  const [selectedDesignation, setSelectedDesignation] = React.useState<string>("all");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedUserId, setSelectedUserId] = React.useState<string>(
    !canAccessAllUpsells && user?.id ? String(user.id) : "all"
  );

  React.useEffect(() => {
    if (!canAccessAllUpsells && user?.id) {
      setSelectedUserId(String(user.id));
    }
  }, [canAccessAllUpsells, user?.id]);

  // Search fields
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [orderNoSearch, setOrderNoSearch] = React.useState("");
  const [customerNameSearch, setCustomerNameSearch] = React.useState("");
  const [customerPhoneSearch, setCustomerPhoneSearch] = React.useState("");
  const [customerEmailSearch, setCustomerEmailSearch] = React.useState("");
  const [productSearch, setProductSearch] = React.useState("");

  // Sort & Pagination
  const [sortBy, setSortBy] = React.useState<string>("date_desc");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(20);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = React.useState(false);

  // Active customer history drilldown
  const [activeCustomerDrilldown, setActiveCustomerDrilldown] = React.useState<{
    phone?: string;
    name?: string;
  } | null>(null);

  const dates = React.useMemo(() => {
    if (timePreset === "custom") {
      return { start: customStart || undefined, end: customEnd || undefined };
    }
    return getDateRange(timePreset);
  }, [timePreset, customStart, customEnd]);

  const { data, isLoading, mutate } = useUpsellReport({
    view: viewMode,
    startDate: dates.start,
    endDate: dates.end,
    departmentId: selectedDepartment,
    designationId: selectedDesignation,
    mainCategoryId: selectedCategory,
    userId: selectedUserId,
    search: debouncedSearch,
    orderNo: orderNoSearch,
    customerName: activeCustomerDrilldown?.name || customerNameSearch,
    customerPhone: activeCustomerDrilldown?.phone || customerPhoneSearch,
    customerEmail: customerEmailSearch,
    productSearch: productSearch,
    sortBy: sortBy,
    sortOrder: sortOrder,
    page,
    limit,
  });

  const summary = data?.summary;
  const meta = data?.meta;
  const records = data?.data?.data || [];
  const pagination = data?.data;

  // Filter designations based on selected department
  const filteredDesignations = React.useMemo(() => {
    if (!meta?.designations) return [];
    if (!selectedDepartment || selectedDepartment === "all") {
      return meta.designations;
    }
    return meta.designations.filter((d) => String(d.department_id) === selectedDepartment);
  }, [meta?.designations, selectedDepartment]);

  // Handle drilldown on customer
  const handleDrilldownCustomer = (phone: string, name: string) => {
    setActiveCustomerDrilldown({ phone, name });
    setViewMode("orders");
    setPage(1);
  };

  const handleClearCustomerDrilldown = () => {
    setActiveCustomerDrilldown(null);
    setCustomerPhoneSearch("");
    setCustomerNameSearch("");
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedDepartment("all");
    setSelectedDesignation("all");
    setSelectedCategory("all");
    setSelectedUserId(!canAccessAllUpsells && user?.id ? String(user.id) : "all");
    setSearchQuery("");
    setOrderNoSearch("");
    setCustomerNameSearch("");
    setCustomerPhoneSearch("");
    setCustomerEmailSearch("");
    setProductSearch("");
    setActiveCustomerDrilldown(null);
    setTimePreset("all_time");
    setCustomStart("");
    setCustomEnd("");
    setSortBy(viewMode === "orders" ? "date_desc" : "revenue");
    setPage(1);
  };

  const hasActiveFilters =
    selectedDepartment !== "all" ||
    selectedDesignation !== "all" ||
    selectedCategory !== "all" ||
    (canAccessAllUpsells && selectedUserId !== "all") ||
    !!searchQuery ||
    !!orderNoSearch ||
    !!customerNameSearch ||
    !!customerPhoneSearch ||
    !!customerEmailSearch ||
    !!productSearch ||
    !!activeCustomerDrilldown ||
    timePreset !== "all_time";

  if (isLoading && !data) {
    return <UpsellReportSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header + Toolbar combined (Orders page design) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Title + description (hidden on mobile, shown on sm+) */}
        <div className="space-y-1 hidden sm:block">
          <h1 className="text-3xl tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        {/* Mobile: Title shown above */}
        <div className="space-y-1 sm:hidden">
          <h1 className="text-2xl tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        {/* Controls: on mobile = full-width row, desktop = stacked column on right */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/hrm/leaderboard">
                <Award className="mr-2 size-4 text-amber-500" />
                Leaderboard
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Select
                value={timePreset}
                onValueChange={(v) => {
                  setTimePreset(v as TimePreset);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32 sm:w-36">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(timePresetLabels) as TimePreset[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {timePresetLabels[p]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Custom date inputs — inline on desktop only */}
              {timePreset === "custom" && (
                <div className="hidden sm:flex items-center gap-2">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="h-8 w-36 text-xs"
                    value={customStart}
                    onChange={(e) => {
                      setCustomStart(e.target.value);
                      setPage(1);
                    }}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    className="h-8 w-36 text-xs"
                    value={customEnd}
                    onChange={(e) => {
                      setCustomEnd(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              )}

              <Button
                size="icon"
                variant="outline"
                aria-label="Refresh report"
                onClick={() => mutate()}
                disabled={isLoading}
              >
                <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Custom date inputs — own row on mobile only */}
          {timePreset === "custom" && (
            <div className="flex sm:hidden items-center gap-2 w-full">
              <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                className="h-8 flex-1 text-xs"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setPage(1);
                }}
              />
              <span className="text-xs text-muted-foreground shrink-0">to</span>
              <Input
                type="date"
                className="h-8 flex-1 text-xs"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Strip (Connected card design matching OrderStats) */}
      <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
        <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-2 lg:grid-cols-4 lg:[&>*]:border-b-0 lg:[&>*:not(:last-child)]:border-r lg:[&>*:last-child]:border-r-0">
          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Delivered Upsell Revenue</CardTitle>
              <CardAction>
                <DollarSign className="size-4 text-emerald-500" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-2xl leading-none tracking-tight font-semibold text-emerald-600 dark:text-emerald-400">
                ৳{(summary?.total_upsell_amount ?? 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Delivered &amp; Partial orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Delivered Upsold Orders</CardTitle>
              <CardAction>
                <Package className="size-4 text-blue-500" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-2xl leading-none tracking-tight font-semibold">
                {(summary?.total_upsell_orders || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Completed orders count</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Average Upsell Delta</CardTitle>
              <CardAction>
                <TrendingUp className="size-4 text-amber-500" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-2xl leading-none tracking-tight font-semibold">
                ৳{(summary?.avg_upsell_amount ?? 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Per upsold order</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal text-sm">Top Upseller</CardTitle>
              <CardAction>
                <Award className="size-4 text-purple-500" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl leading-none tracking-tight font-semibold truncate">
                {summary?.top_upseller?.name || "None yet"}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  ৳{(summary?.top_upseller?.total_upsell || 0).toLocaleString()}
                </span>
                {summary?.top_upseller?.department && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                    {summary.top_upseller.department}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Lifetime Upsell Drilldown Notice */}
      {activeCustomerDrilldown && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-primary text-primary-foreground">
              <History className="size-3.5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Customer Drilldown:{" "}
                <span className="text-primary underline font-bold">
                  {activeCustomerDrilldown.name || "Customer"} ({activeCustomerDrilldown.phone})
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Showing all delivered upsold orders for this customer.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearCustomerDrilldown}
            className="text-xs h-7 gap-1 border-primary/30 text-primary hover:bg-primary/10"
          >
            <X className="size-3" /> Clear Customer Filter
          </Button>
        </div>
      )}

      {/* Main Table Card (Orders table design) */}
      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-normal text-muted-foreground text-sm">
              {viewMode === "orders"
                ? "Upsell Order Records"
                : viewMode === "products"
                ? "Upsold Products Summary"
                : "Employee Performance Ranking"}
            </CardTitle>
            <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
              {pagination?.total
                ? `${pagination.total.toLocaleString()} ${
                    viewMode === "orders" ? "orders" : viewMode === "products" ? "products" : "employees"
                  }`
                : `${records.length} ${
                    viewMode === "orders" ? "orders" : viewMode === "products" ? "products" : "employees"
                  }`}
            </CardDescription>
          </div>

          <CardAction className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-full sm:w-72 xl:w-96 rounded-[min(var(--radius-md),12px)] pl-8 text-xs"
                aria-label="Search upsell report"
                placeholder={
                  viewMode === "orders"
                    ? "Search order #, customer, employee, product..."
                    : viewMode === "products"
                    ? "Search product title or SKU..."
                    : "Search employee name, email..."
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => {
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                setPage(1);
              }}
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              aria-label="Toggle sort order"
            >
              <ArrowUpDown className="size-4" />
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0">
          {/* View Mode Buttons (matching status filter pills in Orders page) */}
          <div className="flex flex-col gap-2 px-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground shrink-0">
                View Mode:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={viewMode === "orders" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5 gap-1.5"
                onClick={() => {
                  setViewMode("orders");
                  setSortBy("date_desc");
                  setPage(1);
                }}
              >
                <ShoppingBag className="size-3.5" />
                Order-wise
              </Button>
              <Button
                variant={viewMode === "products" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5 gap-1.5"
                onClick={() => {
                  setViewMode("products");
                  setSortBy("revenue");
                  setPage(1);
                }}
              >
                <Layers className="size-3.5" />
                Product-wise
              </Button>
              <Button
                variant={viewMode === "employees" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5 gap-1.5"
                onClick={() => {
                  setViewMode("employees");
                  setSortBy("revenue");
                  setPage(1);
                }}
              >
                <Users className="size-3.5" />
                Employee-wise
              </Button>
            </div>
          </div>

          {/* Filter Controls Toolbar (matching Orders table toolbar) */}
          <div className="flex flex-wrap items-center gap-2 px-4">
            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                setSelectedCategory(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {meta?.main_categories?.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select
              value={selectedDepartment}
              onValueChange={(val) => {
                setSelectedDepartment(val);
                setSelectedDesignation("all");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {meta?.departments?.map((dept) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Designation Filter */}
            <Select
              value={selectedDesignation}
              onValueChange={(val) => {
                setSelectedDesignation(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="All Designations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {filteredDesignations.map((desig) => (
                  <SelectItem key={desig.id} value={String(desig.id)}>
                    {desig.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Select */}
            <Select
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                {viewMode === "orders" && (
                  <>
                    <SelectItem value="date_desc">Latest Order</SelectItem>
                    <SelectItem value="date_asc">Oldest Order</SelectItem>
                    <SelectItem value="amount">Highest Upsell</SelectItem>
                    <SelectItem value="order_no">Order #</SelectItem>
                  </>
                )}
                {viewMode === "products" && (
                  <>
                    <SelectItem value="revenue">Highest Revenue</SelectItem>
                    <SelectItem value="qty">Most Units Sold</SelectItem>
                    <SelectItem value="orders">Most Orders</SelectItem>
                  </>
                )}
                {viewMode === "employees" && (
                  <>
                    <SelectItem value="revenue">Highest Upsell Gain</SelectItem>
                    <SelectItem value="orders">Most Orders</SelectItem>
                    <SelectItem value="department">By Department</SelectItem>
                    <SelectItem value="designation">By Designation</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              size="sm"
              variant={isAdvancedFilterOpen ? "secondary" : "outline"}
              className="h-8 text-xs gap-1.5"
              onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
            >
              <Filter className="size-3.5" />
              <span className="hidden sm:inline">Advanced Search</span>
              <ChevronDown
                className={`size-3 transition-transform ${isAdvancedFilterOpen ? "rotate-180" : ""}`}
              />
            </Button>

            {hasActiveFilters && (
              <Button
                variant="secondary"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleResetFilters}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Collapsible Advanced Search Row */}
          {isAdvancedFilterOpen && (
            <div className="mx-4 p-3 rounded-lg border bg-muted/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
                  <Phone className="size-3" /> Customer Phone
                </Label>
                <Input
                  placeholder="e.g. 017XXXXXXXX"
                  value={customerPhoneSearch}
                  onChange={(e) => {
                    setCustomerPhoneSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
                  <UserIcon className="size-3" /> Customer Name
                </Label>
                <Input
                  placeholder="Customer name..."
                  value={customerNameSearch}
                  onChange={(e) => {
                    setCustomerNameSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
                  <Mail className="size-3" /> Customer Email
                </Label>
                <Input
                  placeholder="Email address..."
                  value={customerEmailSearch}
                  onChange={(e) => {
                    setCustomerEmailSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
                  <Package className="size-3" /> Order #
                </Label>
                <Input
                  placeholder="ORD-XXXX..."
                  value={orderNoSearch}
                  onChange={(e) => {
                    setOrderNoSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4 space-y-1">
                <Label className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
                  <Layers className="size-3" /> Product Title / SKU
                </Label>
                <Input
                  placeholder="Search specific product title or SKU..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {/* Table Container (matching Orders page table wrapper and styles) */}
          <div className="w-full overflow-x-auto">
            {/* VIEW 1: Order-wise Report */}
            {viewMode === "orders" && (
              <Table className="w-full min-w-[1000px]">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="min-w-[170px]">Order &amp; Date</TableHead>
                    <TableHead className="min-w-[180px]">Customer</TableHead>
                    <TableHead className="min-w-[180px]">Credited Employee</TableHead>
                    <TableHead className="min-w-[220px]">Upsold Product</TableHead>
                    <TableHead className="text-right min-w-[100px]">Initial</TableHead>
                    <TableHead className="text-right min-w-[110px]">Order Value</TableHead>
                    <TableHead className="text-right min-w-[140px]">Upsell Gain</TableHead>
                    <TableHead className="text-center min-w-[110px]">Order Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="size-6 animate-spin text-primary" />
                          <span className="text-sm">Loading upsell records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-48">
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                            <Flame className="size-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium">No delivered upsells found</p>
                          <p className="text-xs text-muted-foreground">
                            Upsells are credited when an order with an employee value increase reaches Delivered or Partial status.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((item: UpsellRecord) => {
                      const dt = formatOrderDateTime(item.created_at);
                      const customerName = item.order?.customer_full_name || "Guest Customer";
                      const customerInitials = getInitials(customerName);
                      const empName = item.user?.full_name || item.user?.name || "Employee";

                      return (
                        <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                          {/* Order & Date */}
                          <TableCell>
                            <div className="flex flex-col gap-1 text-left min-w-[150px]">
                              <Link
                                href={`/dashboard/orders/${item.order_no}`}
                                className="font-mono text-sm font-bold tracking-tight whitespace-nowrap text-foreground hover:text-primary hover:underline inline-flex items-center gap-1.5"
                              >
                                #{item.order_no}
                                <ExternalLink className="size-3 text-muted-foreground/60" />
                              </Link>
                              <div className="flex flex-col text-[11px] text-muted-foreground leading-tight">
                                <span className="whitespace-nowrap">
                                  {dt.date} · {dt.time}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Customer */}
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar className="size-8">
                                <AvatarFallback className="text-[10px] font-bold">
                                  {customerInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-[120px] max-w-[170px]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDrilldownCustomer(
                                      item.order?.customer_phone || "",
                                      item.order?.customer_full_name || ""
                                    )
                                  }
                                  className="text-sm font-medium leading-tight whitespace-normal break-words text-left hover:text-primary flex items-center gap-1 group"
                                  title="Filter customer's upsell history"
                                >
                                  {customerName}
                                  <History className="size-3 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                                </button>
                                <p className="text-[11px] text-muted-foreground whitespace-normal break-words mt-0.5">
                                  {item.order?.customer_phone || "—"}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Credited Employee */}
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar className="size-8">
                                <AvatarImage
                                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    empName
                                  )}&background=random`}
                                  alt={empName}
                                />
                                <AvatarFallback className="text-[10px] font-bold">
                                  {getInitials(empName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0 max-w-[160px]">
                                <span className="text-xs font-semibold text-foreground truncate">
                                  {empName}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {item.user?.employee_detail?.designation?.title || "Executive"}
                                  {item.user?.employee_detail?.department?.name &&
                                    ` · ${item.user.employee_detail.department.name}`}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Upsold Products */}
                          <TableCell>
                            <div className="flex flex-col gap-2 min-w-[200px] max-w-[260px]">
                              {item.items && item.items.length > 0 ? (
                                item.items.map((prod, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    {prod.img ? (
                                      <img
                                        src={getImageUrl(prod.img)}
                                        alt={prod.title}
                                        className="size-8 rounded-md object-cover border shrink-0 bg-muted/20"
                                      />
                                    ) : (
                                      <div className="size-8 rounded-md bg-muted flex items-center justify-center border text-muted-foreground shrink-0">
                                        <Package className="size-4 opacity-60" />
                                      </div>
                                    )}
                                    <div className="flex flex-col min-w-0">
                                      <span
                                        className="text-xs font-medium text-foreground truncate max-w-[180px]"
                                        title={prod.title}
                                      >
                                        {prod.title}
                                      </span>
                                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <span className="font-semibold text-primary">
                                          {prod.qty || prod.delivered_qty || 1}x ৳
                                          {Number(prod.unit_price).toLocaleString()}
                                        </span>
                                        {prod.sku && prod.sku !== "-" && (
                                          <span className="font-mono text-muted-foreground/75">
                                            ({prod.sku})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground italic">
                                  No product items specified
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Initial Amount */}
                          <TableCell className="text-right text-xs font-mono text-muted-foreground">
                            ৳{Number(item.previous_amount).toLocaleString()}
                          </TableCell>

                          {/* Order Value (Upsold Total) */}
                          <TableCell className="text-right text-xs font-mono font-semibold text-foreground">
                            ৳{Number(item.new_amount).toLocaleString()}
                          </TableCell>

                          {/* Upsell Gain */}
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold gap-1">
                                <CheckCircle2 className="size-3 text-emerald-600" />
                                +৳
                                {Number(
                                  item.eligible_upsell_amount || item.upsell_amount
                                ).toLocaleString()}
                              </Badge>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                Delivered &amp; Verified
                              </span>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold py-0.5 px-2 ${
                                item.order?.order_status === "Delivered"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              }`}
                            >
                              {item.order?.order_status || "Delivered"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}

            {/* VIEW 2: Product-wise Report */}
            {viewMode === "products" && (
              <Table className="w-full min-w-[1000px]">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="min-w-[260px]">Product</TableHead>
                    <TableHead className="min-w-[140px]">Main Category</TableHead>
                    <TableHead className="text-right min-w-[120px]">Units Delivered</TableHead>
                    <TableHead className="text-right min-w-[140px]">Upsell Gain</TableHead>
                    <TableHead className="text-right min-w-[120px]">Orders Count</TableHead>
                    <TableHead className="text-right min-w-[140px]">Avg Gain / Order</TableHead>
                    <TableHead className="text-center min-w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="size-6 animate-spin text-primary" />
                          <span className="text-sm">Loading product breakdown...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-48">
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                            <Layers className="size-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium">No upsold products found</p>
                          <p className="text-xs text-muted-foreground">
                            Products delivered within upsold orders will be listed here.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((prod: UpsellProductRecord) => (
                      <TableRow key={prod.product_id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {prod.img ? (
                              <img
                                src={getImageUrl(prod.img)}
                                alt={prod.title}
                                className="size-9 rounded-md object-cover border"
                              />
                            ) : (
                              <div className="size-9 rounded-md bg-muted flex items-center justify-center border text-muted-foreground">
                                <Package className="size-4" />
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-xs text-foreground truncate max-w-[280px]" title={prod.title}>
                                {prod.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                SKU: {prod.sku || "—"}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-medium">
                            <Tag className="size-3 mr-1 text-primary" />
                            {prod.main_category_name || "Uncategorized"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right font-semibold text-sm text-foreground">
                          {prod.total_qty.toLocaleString()}
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                            ৳{prod.total_revenue.toLocaleString()}
                          </span>
                        </TableCell>

                        <TableCell className="text-right font-medium text-xs text-foreground">
                          {prod.orders_count} orders
                        </TableCell>

                        <TableCell className="text-right text-xs text-muted-foreground">
                          ৳
                          {prod.orders_count > 0
                            ? Math.round(prod.total_revenue / prod.orders_count).toLocaleString()
                            : "0"}
                        </TableCell>

                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setProductSearch(prod.title);
                              setViewMode("orders");
                              setPage(1);
                            }}
                            className="h-7 text-xs text-primary hover:bg-primary/10"
                          >
                            View Orders
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {/* VIEW 3: Employee-wise Report */}
            {viewMode === "employees" && (
              <Table className="w-full min-w-[1000px]">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-12 text-center">Rank</TableHead>
                    <TableHead className="min-w-[200px]">Employee</TableHead>
                    <TableHead className="min-w-[140px]">Department</TableHead>
                    <TableHead className="min-w-[140px]">Designation</TableHead>
                    <TableHead className="text-right min-w-[120px]">Upsold Orders</TableHead>
                    <TableHead className="text-right min-w-[150px]">Total Upsell Gain</TableHead>
                    <TableHead className="text-right min-w-[140px]">Avg Upsell / Order</TableHead>
                    <TableHead className="text-center min-w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="size-6 animate-spin text-primary" />
                          <span className="text-sm">Loading employee performance...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-48">
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                            <Users className="size-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium">No employee upsells recorded</p>
                          <p className="text-xs text-muted-foreground">
                            Employees who successfully generate delivered upsell revenue will appear here.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((emp: UpsellEmployeeRecord, idx: number) => {
                      const rankNum = (page - 1) * limit + idx + 1;
                      return (
                        <TableRow key={emp.user_id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="text-center">
                            {rankNum === 1 ? (
                              <span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-500/20 text-amber-600 font-bold text-xs">
                                🥇
                              </span>
                            ) : rankNum === 2 ? (
                              <span className="inline-flex items-center justify-center size-6 rounded-full bg-slate-300/40 text-slate-700 font-bold text-xs">
                                🥈
                              </span>
                            ) : rankNum === 3 ? (
                              <span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-700/20 text-amber-800 font-bold text-xs">
                                🥉
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground font-semibold">
                                #{rankNum}
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar className="size-8">
                                <AvatarImage src={emp.avatar} alt={emp.name} />
                                <AvatarFallback className="text-[10px] font-bold">
                                  {getInitials(emp.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-foreground text-xs truncate">
                                  {emp.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {emp.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="secondary" className="text-[10px] font-medium">
                              {emp.department_name || "General"}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground">
                            {emp.designation_title || "Executive"}
                          </TableCell>

                          <TableCell className="text-right font-semibold text-xs text-foreground">
                            {emp.orders_count} orders
                          </TableCell>

                          <TableCell className="text-right">
                            <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                              +৳{emp.total_upsell.toLocaleString()}
                            </span>
                          </TableCell>

                          <TableCell className="text-right text-xs text-muted-foreground">
                            ৳{emp.avg_upsell.toLocaleString()}
                          </TableCell>

                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUserId(String(emp.user_id));
                                setViewMode("orders");
                                setPage(1);
                              }}
                              className="h-7 text-xs text-primary hover:bg-primary/10"
                            >
                              View Orders
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination Footer (Orders table design) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select
                value={`${limit}`}
                onValueChange={(v) => {
                  setLimit(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50, 100].map((s) => (
                    <SelectItem key={s} value={`${s}`}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground mr-2">
                Page {pagination?.current_page || page} of {pagination?.last_page || 1}
              </span>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setPage(1)}
                disabled={page <= 1 || isLoading}
                aria-label="First page"
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination || page >= pagination.last_page || isLoading}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setPage(pagination?.last_page || 1)}
                disabled={!pagination || page >= pagination.last_page || isLoading}
                aria-label="Last page"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UpsellReportSkeleton() {
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
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 [&>*]:border-b lg:[&>*]:border-b-0 [&>*:nth-child(odd)]:border-r lg:[&>*:not(:last-child)]:border-r p-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="size-4 rounded-full" />
              </div>
              <Skeleton className="h-7 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-4 border-b">
          <Skeleton className="h-8 w-52 rounded-md" />
          <Skeleton className="h-8 w-64 rounded-md" />
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
