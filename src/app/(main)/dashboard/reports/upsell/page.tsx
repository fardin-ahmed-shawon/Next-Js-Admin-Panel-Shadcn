"use client";

import * as React from "react";
import {
  Flame,
  TrendingUp,
  Search,
  Filter,
  Users,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Package,
  Loader2,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  Phone,
  Mail,
  User as UserIcon,
  ShoppingBag,
  Layers,
  ArrowUpDown,
  X,
  History,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useUpsellReport,
  UpsellRecord,
  UpsellProductRecord,
  UpsellEmployeeRecord,
} from "@/hooks/useUpsellReport";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { hasAllUserAccess } from "@/hooks/useRoles";

type TimePreset = "today" | "this_week" | "this_month" | "last_month" | "all_time" | "custom";
type ViewMode = "orders" | "products" | "employees";

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

export default function UpsellReportPage() {
  const { user } = useAuth();
  const canAccessAllUpsells = hasAllUserAccess(user, "upsells");

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

  // Multi-attribute searches
  const [searchQuery, setSearchQuery] = React.useState("");
  const [orderNoSearch, setOrderNoSearch] = React.useState("");
  const [customerNameSearch, setCustomerNameSearch] = React.useState("");
  const [customerPhoneSearch, setCustomerPhoneSearch] = React.useState("");
  const [customerEmailSearch, setCustomerEmailSearch] = React.useState("");
  const [productSearch, setProductSearch] = React.useState("");

  // Sort
  const [sortBy, setSortBy] = React.useState<string>("date_desc");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState<number>(1);
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
    search: searchQuery,
    orderNo: orderNoSearch,
    customerName: activeCustomerDrilldown?.name || customerNameSearch,
    customerPhone: activeCustomerDrilldown?.phone || customerPhoneSearch,
    customerEmail: customerEmailSearch,
    productSearch: productSearch,
    sortBy: sortBy,
    sortOrder: sortOrder,
    page,
    limit: 20,
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
    setSelectedUserId("all");
    setSearchQuery("");
    setOrderNoSearch("");
    setCustomerNameSearch("");
    setCustomerPhoneSearch("");
    setCustomerEmailSearch("");
    setProductSearch("");
    setActiveCustomerDrilldown(null);
    setTimePreset("all_time");
    setSortBy("date_desc");
    setPage(1);
  };

  const hasActiveFilters =
    selectedDepartment !== "all" ||
    selectedDesignation !== "all" ||
    selectedCategory !== "all" ||
    selectedUserId !== "all" ||
    !!searchQuery ||
    !!orderNoSearch ||
    !!customerNameSearch ||
    !!customerPhoneSearch ||
    !!customerEmailSearch ||
    !!productSearch ||
    !!activeCustomerDrilldown ||
    timePreset !== "all_time";

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Upsell Performance Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Track revenue growth created when employees increase order values on completed Delivered &amp; Partial orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/hrm/leaderboard">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              HRM Leaderboard
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-card hover:border-emerald-500/30 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Delivered Upsell Revenue
              </p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ৳{(summary?.total_upsell_amount ?? 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Delivered &amp; Partial orders only
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card hover:border-blue-500/30 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Delivered Upsold Orders
              </p>
              <h3 className="text-2xl font-black text-foreground mt-1">
                {summary?.total_upsell_orders || 0}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Verified Delivered &amp; Partial orders
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
              <Package className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card hover:border-amber-500/30 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Average Upsell Delta
              </p>
              <h3 className="text-2xl font-black text-foreground mt-1">
                ৳{(summary?.avg_upsell_amount ?? 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Per delivered upsell order
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card hover:border-purple-500/30 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Top Upseller
              </p>
              <h3 className="text-base font-bold text-foreground mt-1 truncate">
                {summary?.top_upseller?.name || "None yet"}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                  ৳{summary?.top_upseller?.total_upsell ? summary.top_upseller.total_upsell.toLocaleString() : "0"}
                </span>
                {summary?.top_upseller?.department && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1">
                    {summary.top_upseller.department}
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 shrink-0">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Customer Drilldown Banner */}
      {activeCustomerDrilldown && (
        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <History className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground flex items-center gap-2">
                Viewing Lifetime Upsell History for Customer:
                <span className="text-primary underline">
                  {activeCustomerDrilldown.name || "Customer"} ({activeCustomerDrilldown.phone})
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Showing all upsold orders delivered for this customer.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearCustomerDrilldown}
            className="text-xs h-8 gap-1.5 border-primary/30 hover:bg-primary/10 text-primary"
          >
            <X className="w-3.5 h-3.5" /> Clear Customer Filter
          </Button>
        </div>
      )}

      {/* Reporting Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-1">
        <Tabs
          value={viewMode}
          onValueChange={(val) => {
            setViewMode(val as ViewMode);
            setPage(1);
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-auto h-10 p-1 bg-muted/60">
            <TabsTrigger value="orders" className="text-xs font-bold gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> Order-wise
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs font-bold gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Product-wise
            </TabsTrigger>
            <TabsTrigger value="employees" className="text-xs font-bold gap-1.5">
              <Users className="w-3.5 h-3.5" /> Employee-wise
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* View Details Count */}
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>
            Showing <strong className="text-foreground">{records.length}</strong> of{" "}
            <strong className="text-foreground">{pagination?.total || 0}</strong> {viewMode}
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filter & Search Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 space-y-3">
          {/* Primary Quick Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search order #, customer, employee, product..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Main Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                setSelectedCategory(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <Tag className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Main Category" />
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
              <SelectTrigger className="w-[170px] h-9 text-xs">
                <Building2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Department" />
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

            {/* Designation Filter (dynamically filtered by Department) */}
            <Select
              value={selectedDesignation}
              onValueChange={(val) => {
                setSelectedDesignation(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[170px] h-9 text-xs">
                <Briefcase className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Designation" />
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

            {/* Time Presets */}
            <Select
              value={timePreset}
              onValueChange={(val) => {
                setTimePreset(val as TimePreset);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_time">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Dropdown */}
            <Select
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
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

            {/* Toggle Advanced Customer / Order Search */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              className="h-9 text-xs gap-1.5"
            >
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              {isAdvancedFilterOpen ? "Hide Search" : "Customer / Product Search"}
              {isAdvancedFilterOpen ? (
                <ChevronUp className="w-3.5 h-3.5 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              )}
            </Button>
          </div>

          {/* Custom Date Range Picker */}
          {timePreset === "custom" && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-muted-foreground font-semibold">Date Range:</span>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 w-36 text-xs"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 w-36 text-xs"
              />
            </div>
          )}

          {/* Advanced Multi-Attribute Search Row (Customer Full History, Order #, Product SKU) */}
          {isAdvancedFilterOpen && (
            <div className="p-3 rounded-lg bg-muted/40 border border-muted/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                  <Phone className="w-3 h-3 text-primary" /> Customer Phone No
                </label>
                <Input
                  placeholder="e.g. 017XXXXXXXX"
                  value={customerPhoneSearch}
                  onChange={(e) => {
                    setCustomerPhoneSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                  <UserIcon className="w-3 h-3" /> Customer Name
                </label>
                <Input
                  placeholder="Customer name..."
                  value={customerNameSearch}
                  onChange={(e) => {
                    setCustomerNameSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                  <Mail className="w-3 h-3" /> Customer Email
                </label>
                <Input
                  placeholder="Email address..."
                  value={customerEmailSearch}
                  onChange={(e) => {
                    setCustomerEmailSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                  <Package className="w-3 h-3" /> Order #
                </label>
                <Input
                  placeholder="ORD-XXXX..."
                  value={orderNoSearch}
                  onChange={(e) => {
                    setOrderNoSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                  <Layers className="w-3 h-3" /> Product Title / SKU Search
                </label>
                <Input
                  placeholder="Search specific product title or SKU included in upsell..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Reporting Content */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* VIEW 1: Order-wise Report */}
            {viewMode === "orders" && (
              <Table>
                <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
                  <TableRow>
                    <TableHead className="min-w-[130px]">Date &amp; Time</TableHead>
                    <TableHead className="min-w-[180px]">Credited Employee</TableHead>
                    <TableHead className="min-w-[130px]">Department</TableHead>
                    <TableHead className="min-w-[140px]">Order &amp; Status</TableHead>
                    <TableHead className="min-w-[160px]">Customer (History)</TableHead>
                    <TableHead className="min-w-[220px]">Upsold Product</TableHead>
                    <TableHead className="text-right min-w-[90px]">Initial</TableHead>
                    <TableHead className="text-right min-w-[95px]">Order Value</TableHead>
                    <TableHead className="text-right min-w-[140px]">Upsell Gain</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-16 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-sm">Loading upsell records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-16 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Flame className="w-10 h-10 text-muted-foreground/30 mb-2" />
                          <p className="font-semibold text-sm text-foreground">No delivered upsells found</p>
                          <p className="text-xs text-muted-foreground">
                            Upsells are credited when an order with an employee value increase reaches Delivered or Partial status.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((item: UpsellRecord) => (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                        {/* Date & Time */}
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(item.created_at).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>

                        {/* Employee */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  item.user?.full_name || item.user?.name || "Emp"
                                )}&background=random`}
                                alt={item.user?.name}
                              />
                              <AvatarFallback className="text-[10px] font-bold">
                                {(item.user?.name || "E").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground text-xs truncate">
                                {item.user?.full_name || item.user?.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {item.user?.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Department & Designation */}
                        <TableCell>
                          <div className="flex flex-col items-start gap-0.5">
                            <Badge variant="secondary" className="text-[10px] font-semibold">
                              {item.user?.employee_detail?.department?.name || "General"}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {item.user?.employee_detail?.designation?.title || "Executive"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Order & Status */}
                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            <Link
                              href={`/dashboard/orders/${item.order_no}`}
                              className="font-mono text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                            >
                              #{item.order_no}
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </Link>
                            {item.order?.order_status && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-medium py-0 px-1.5 ${
                                  item.order.order_status === "Delivered"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                }`}
                              >
                                {item.order.order_status}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Customer & History Drilldown */}
                        <TableCell>
                          <div className="flex flex-col text-xs min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                handleDrilldownCustomer(
                                  item.order?.customer_phone || "",
                                  item.order?.customer_full_name || ""
                                )
                              }
                              className="font-bold text-foreground hover:text-primary text-left truncate flex items-center gap-1 group"
                              title="Click to view this customer's full upsold history"
                            >
                              {item.order?.customer_full_name || "Guest Customer"}
                              <History className="w-3 h-3 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                            </button>
                            <span className="text-muted-foreground text-[11px]">
                              {item.order?.customer_phone || "-"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Upsold Product Only with Image */}
                        <TableCell>
                          <div className="flex flex-col gap-2 min-w-[200px] max-w-[280px]">
                            {item.items && item.items.length > 0 ? (
                              item.items.map((prod, idx) => (
                                <div key={idx} className="flex items-center gap-2.5">
                                  {prod.img ? (
                                    <img
                                      src={getImageUrl(prod.img)}
                                      alt={prod.title}
                                      className="w-10 h-10 rounded-md object-cover border shrink-0 bg-muted/20"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border text-muted-foreground shrink-0">
                                      <Package className="w-5 h-5 opacity-60" />
                                    </div>
                                  )}
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-foreground truncate max-w-[160px]" title={prod.title}>
                                      {prod.title}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                      <span className="font-semibold text-primary">
                                        {prod.qty || prod.delivered_qty || 1}x ৳{Number(prod.unit_price).toLocaleString()}
                                      </span>
                                      {prod.sku && prod.sku !== "-" && (
                                        <span className="font-mono text-[10px] text-muted-foreground/70">
                                          ({prod.sku})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No upsold item specified</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Initial Amount */}
                        <TableCell className="text-right text-xs font-semibold text-muted-foreground">
                          ৳{Number(item.previous_amount).toLocaleString()}
                        </TableCell>

                        {/* Order Value (Upsold Subtotal) */}
                        <TableCell className="text-right text-xs font-bold text-foreground">
                          ৳{Number(item.new_amount).toLocaleString()}
                        </TableCell>

                        {/* Upsell Gain */}
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs font-black gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              +৳{Number(item.eligible_upsell_amount || item.upsell_amount).toLocaleString()}
                            </Badge>
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              Delivered &amp; Verified
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {/* VIEW 2: Product-wise Report */}
            {viewMode === "products" && (
              <Table>
                <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
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
                      <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-sm">Loading product breakdown...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Layers className="w-10 h-10 text-muted-foreground/30 mb-2" />
                          <p className="font-semibold text-sm text-foreground">No upsold products found</p>
                          <p className="text-xs text-muted-foreground">
                            Products delivered within upsold orders will be listed here.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((prod: UpsellProductRecord) => (
                      <TableRow key={prod.product_id} className="hover:bg-muted/30 transition-colors">
                        {/* Product info */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {prod.img ? (
                              <img
                                src={getImageUrl(prod.img)}
                                alt={prod.title}
                                className="w-9 h-9 rounded-md object-cover border"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center border text-muted-foreground">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-xs text-foreground truncate" title={prod.title}>
                                {prod.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                SKU: {prod.sku}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Main Category */}
                        <TableCell>
                          <Badge variant="outline" className="text-[11px] font-semibold">
                            <Tag className="w-3 h-3 mr-1 text-primary" />
                            {prod.main_category_name}
                          </Badge>
                        </TableCell>

                        {/* Delivered Units */}
                        <TableCell className="text-right font-black text-sm text-foreground">
                          {prod.total_qty.toLocaleString()}
                        </TableCell>

                        {/* Total Revenue */}
                        <TableCell className="text-right">
                          <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                            ৳{prod.total_revenue.toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Orders count */}
                        <TableCell className="text-right font-bold text-xs text-foreground">
                          {prod.orders_count} orders
                        </TableCell>

                        {/* Average Revenue per Order */}
                        <TableCell className="text-right text-xs font-semibold text-muted-foreground">
                          ৳
                          {prod.orders_count > 0
                            ? Math.round(prod.total_revenue / prod.orders_count).toLocaleString()
                            : "0"}
                        </TableCell>

                        {/* Action: Filter orders containing this product */}
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
              <Table>
                <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
                  <TableRow>
                    <TableHead className="w-12 text-center">Rank</TableHead>
                    <TableHead className="min-w-[200px]">Employee</TableHead>
                    <TableHead className="min-w-[150px]">Department</TableHead>
                    <TableHead className="min-w-[150px]">Designation</TableHead>
                    <TableHead className="text-right min-w-[120px]">Upsold Orders</TableHead>
                    <TableHead className="text-right min-w-[150px]">Total Upsell Gain</TableHead>
                    <TableHead className="text-right min-w-[140px]">Avg Upsell / Order</TableHead>
                    <TableHead className="text-center min-w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-sm">Loading employee performance...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Users className="w-10 h-10 text-muted-foreground/30 mb-2" />
                          <p className="font-semibold text-sm text-foreground">No employee upsells recorded</p>
                          <p className="text-xs text-muted-foreground">
                            Employees who successfully generate delivered upsell revenue will appear here.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((emp: UpsellEmployeeRecord, idx: number) => (
                      <TableRow key={emp.user_id} className="hover:bg-muted/30 transition-colors">
                        {/* Rank */}
                        <TableCell className="text-center font-black">
                          {idx === 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 font-bold text-xs">
                              🥇
                            </span>
                          ) : idx === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/40 text-slate-700 font-bold text-xs">
                              🥈
                            </span>
                          ) : idx === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-800 font-bold text-xs">
                              🥉
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold">
                              #{idx + 1}
                            </span>
                          )}
                        </TableCell>

                        {/* Employee */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src={emp.avatar} alt={emp.name} />
                              <AvatarFallback className="text-[10px] font-bold">
                                {emp.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground text-xs truncate">
                                {emp.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {emp.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Department */}
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] font-semibold">
                            {emp.department_name}
                          </Badge>
                        </TableCell>

                        {/* Designation */}
                        <TableCell className="text-xs text-muted-foreground">
                          {emp.designation_title}
                        </TableCell>

                        {/* Upsold Orders */}
                        <TableCell className="text-right font-black text-xs text-foreground">
                          {emp.orders_count} orders
                        </TableCell>

                        {/* Total Upsell */}
                        <TableCell className="text-right">
                          <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                            +৳{emp.total_upsell.toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Avg Upsell */}
                        <TableCell className="text-right text-xs font-semibold text-muted-foreground">
                          ৳{emp.avg_upsell.toLocaleString()}
                        </TableCell>

                        {/* Action */}
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
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination Bar */}
          {pagination && pagination.last_page > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Page <strong className="text-foreground">{pagination.current_page}</strong> of{" "}
                <strong className="text-foreground">{pagination.last_page}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.last_page || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
